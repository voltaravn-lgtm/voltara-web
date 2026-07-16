'use client';

import React, { useEffect, useState } from 'react';
import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { deleteApp, getApps, initializeApp } from 'firebase/app';
import { collection, deleteField, doc, limit, onSnapshot, query as firestoreQuery, setDoc } from 'firebase/firestore';
import { Plus, Search, ShieldCheck } from 'lucide-react';
import { db, firebaseConfig } from '../../lib/firebase';
import { DealerAccount } from '../../types';
import { useApp } from '../../context/AppContext';

const blank = { dealerCode: '', name: '', email: '', phone: '', password: '', level: 2 as 1 | 2, status: 'active' as const, customDiscountPercent: '' };
const normalizePhone = (value: string) => {
  const digits = value.replace(/\D/g, '');
  return digits.startsWith('84') ? `0${digits.slice(2)}` : digits;
};
const authEmailFromPhone = (phone: string) => `${normalizePhone(phone)}@dealer.voltara.vn`;
const getFirebaseAccountError = (error: any) => {
  const code = String(error?.code || 'unknown');
  if (code === 'auth/operation-not-allowed') return 'Firebase Authentication chưa bật Email/Password.';
  if (code === 'auth/too-many-requests') return 'Firebase tạm khóa vì thao tác quá nhiều lần. Vui lòng chờ rồi thử lại.';
  if (code === 'auth/weak-password') return 'Mật khẩu chưa đủ mạnh, cần tối thiểu 6 ký tự.';
  if (code === 'auth/invalid-email') return 'Tài khoản kỹ thuật tạo từ số điện thoại không hợp lệ.';
  if (code === 'auth/invalid-credential' || code === 'auth/wrong-password') return 'Tài khoản đã có nhưng mật khẩu cũ không đúng.';
  if (code === 'permission-denied' || code === 'firestore/permission-denied') return 'Firestore Rules đang chặn collection dealerAccounts.';
  return `Không thể tạo tài khoản. Mã lỗi: ${code}`;
};

export default function DealerAccountsAdmin() {
  const { showToast } = useApp();
  const [accounts, setAccounts] = useState<DealerAccount[]>([]);
  const [form, setForm] = useState(blank);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => onSnapshot(firestoreQuery(collection(db, 'dealerAccounts'), limit(50)), (snapshot) => {
    setAccounts(snapshot.docs.map((item) => item.data() as DealerAccount).sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
  }, () => showToast('Không đọc được danh sách tài khoản đại lý.', 'error')), []);

  const createAccount = async (event: React.FormEvent) => {
    event.preventDefault();
    const normalizedPhone = normalizePhone(form.phone);
    if (!/^0\d{9}$/.test(normalizedPhone)) return showToast('Số điện thoại phải gồm 10 số và bắt đầu bằng 0.', 'warning');
    if (form.password.length < 6) return showToast('Mật khẩu cần tối thiểu 6 ký tự.', 'warning');
    setLoading(true);
    let secondaryApp;
    let secondaryAuth: ReturnType<typeof getAuth> | undefined;
    const internalEmail = authEmailFromPhone(normalizedPhone);
    const persistDealerProfile = async (uid: string) => {
      const now = new Date().toISOString();
      const account: DealerAccount = {
        uid,
        dealerCode: form.dealerCode.trim().toUpperCase(),
        name: form.name.trim(),
        email: internalEmail,
        phone: normalizedPhone,
        level: 2,
        status: 'active',
        createdAt: now,
        updatedAt: now,
        ...(form.customDiscountPercent === '' ? {} : { customDiscountPercent: Number(form.customDiscountPercent) }),
      };
      await setDoc(doc(db, 'dealerAccounts', uid), account);
    };
    try {
      const name = `dealer-creator-${Date.now()}`;
      secondaryApp = initializeApp(firebaseConfig, name);
      secondaryAuth = getAuth(secondaryApp);
      const credential = await createUserWithEmailAndPassword(secondaryAuth, internalEmail, form.password);
      await persistDealerProfile(credential.user.uid);
      await signOut(secondaryAuth);
      setForm(blank);
      showToast('Đã cấp tài khoản đại lý thành công.', 'success');
    } catch (error: any) {
      if (error?.code === 'auth/email-already-in-use' && secondaryAuth) {
        try {
          const existing = await signInWithEmailAndPassword(secondaryAuth, internalEmail, form.password);
          await persistDealerProfile(existing.user.uid);
          await signOut(secondaryAuth);
          setForm(blank);
          showToast('Đã khôi phục hồ sơ cho tài khoản đã tồn tại.', 'success');
        } catch (recoveryError: any) {
          console.error('Could not recover dealer account:', recoveryError);
          showToast(getFirebaseAccountError(recoveryError), 'error');
        }
      } else {
        console.error('Could not create dealer account:', error);
        showToast(getFirebaseAccountError(error), 'error');
      }
    } finally {
      if (secondaryApp) await deleteApp(secondaryApp).catch(() => undefined);
      setLoading(false);
    }
  };

  const updateAccount = async (account: DealerAccount, patch: Partial<DealerAccount>) => {
    const firestorePatch: Record<string, unknown> = { ...patch, updatedAt: new Date().toISOString() };
    if (Object.prototype.hasOwnProperty.call(patch, 'customDiscountPercent') && patch.customDiscountPercent === undefined) {
      firestorePatch.customDiscountPercent = deleteField();
    }
    await setDoc(doc(db, 'dealerAccounts', account.uid), firestorePatch, { merge: true });
    showToast('Đã cập nhật quyền đại lý.', 'success');
  };

  const filtered = accounts.filter((item) => `${item.name} ${item.phone || ''} ${item.dealerCode}`.toLowerCase().includes(query.toLowerCase()));

  return <div className="space-y-6">
    <div><h2 className="flex items-center gap-2 font-display text-lg font-black uppercase text-gold-light"><ShieldCheck className="h-5 w-5" /> Tài khoản đại lý</h2><p className="mt-1 text-xs text-gray-400">Cấp tài khoản đăng nhập, gán cấp giá và khóa/mở quyền đặt hàng.</p></div>
    <form onSubmit={createAccount} className="border border-gold-dark/25 bg-black p-5">
      <h3 className="mb-4 text-sm font-black uppercase">Cấp tài khoản mới</h3>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <input required value={form.dealerCode} onChange={(e) => setForm({ ...form, dealerCode: e.target.value })} placeholder="Mã đại lý: DL001" className="border border-white/10 bg-[#111] px-3 py-3 text-xs outline-none focus:border-gold-light" />
        <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Tên đại lý" className="border border-white/10 bg-[#111] px-3 py-3 text-xs outline-none focus:border-gold-light" />
        <input required inputMode="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Số điện thoại đăng nhập" className="border border-white/10 bg-[#111] px-3 py-3 text-base outline-none focus:border-gold-light sm:text-xs" />
        <input required type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Mật khẩu ban đầu" className="border border-white/10 bg-[#111] px-3 py-3 text-xs outline-none focus:border-gold-light" />
        <div className="flex items-center border border-white/10 bg-[#111] px-3 py-3 text-xs text-gray-500">Đăng nhập bằng SĐT + mật khẩu</div>
        <div className="flex items-center border border-gold-dark/25 bg-gold-dark/5 px-3 py-3 text-xs text-gray-400">Cấp khởi tạo: <b className="ml-1 text-gold-light">Đại lý cấp 2</b></div>
        <input type="number" value={form.customDiscountPercent} onChange={(e) => setForm({ ...form, customDiscountPercent: e.target.value })} placeholder="CK riêng (để trống = theo cấp)" className="border border-white/10 bg-[#111] px-3 py-3 text-xs outline-none focus:border-gold-light" />
        <button disabled={loading} className="flex items-center justify-center gap-2 bg-gold-light px-4 py-3 text-xs font-black uppercase text-black disabled:opacity-50"><Plus className="h-4 w-4" /> {loading ? 'Đang tạo...' : 'Cấp tài khoản'}</button>
      </div>
      <p className="mt-3 text-[10px] text-gray-500">Tài khoản mới luôn bắt đầu ở cấp 2. Đại lý đăng nhập bằng số điện thoại và mật khẩu; email kỹ thuật được hệ thống tự tạo, không hiển thị cho đại lý.</p>
    </form>
    <section className="border border-white/10 bg-black">
      <div className="flex flex-col gap-3 border-b border-white/10 p-4 sm:flex-row sm:items-center sm:justify-between"><b className="text-xs uppercase">Danh sách tài khoản ({accounts.length})</b><label className="flex items-center gap-2 border border-white/10 bg-[#111] px-3 py-2"><Search className="h-4 w-4 text-gray-500" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Tìm mã, tên, số điện thoại..." className="bg-transparent text-base outline-none sm:text-xs" /></label></div>
      <div className="overflow-x-auto"><table className="w-full min-w-[820px] text-left text-xs"><thead className="bg-[#111] text-[9px] uppercase text-gray-500"><tr><th className="p-3">Đại lý</th><th className="p-3">Số điện thoại</th><th className="p-3">Cấp giá</th><th className="p-3">CK riêng</th><th className="p-3">Trạng thái</th></tr></thead><tbody>{filtered.map((account) => <tr key={account.uid} className="border-t border-white/5"><td className="p-3"><b className="text-white">{account.name}</b><span className="mt-1 block font-mono text-[10px] text-gold-light">{account.dealerCode}</span></td><td className="p-3 font-mono">{account.phone || 'Chưa cập nhật'}</td><td className="p-3"><select value={account.level} onChange={(e) => updateAccount(account, { level: Number(e.target.value) as 1 | 2 })} className="border border-white/10 bg-[#111] px-3 py-2"><option value={1}>Cấp 1</option><option value={2}>Cấp 2</option></select></td><td className="p-3"><input type="number" defaultValue={account.customDiscountPercent ?? ''} placeholder="Theo cấp" onBlur={(e) => updateAccount(account, { customDiscountPercent: e.target.value === '' ? undefined : Number(e.target.value) })} className="w-24 border border-white/10 bg-[#111] px-3 py-2" /></td><td className="p-3"><button onClick={() => updateAccount(account, { status: account.status === 'active' ? 'locked' : 'active' })} className={`border px-3 py-2 text-[10px] font-bold uppercase ${account.status === 'active' ? 'border-emerald-500/30 text-emerald-400' : 'border-red-500/30 text-red-400'}`}>{account.status === 'active' ? 'Đang hoạt động' : 'Đã khóa'}</button></td></tr>)}</tbody></table></div>
    </section>
  </div>;
}
