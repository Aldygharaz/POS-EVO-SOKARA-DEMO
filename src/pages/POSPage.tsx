import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useStore } from '@/store/useStore';
import { useFormat } from '@/hooks/useFormat';
import type { Product, CartItem, PaymentMethod, Transaction } from '@/types';
import {
  Search, Plus, Minus, Trash2, Receipt, CreditCard,
  Banknote, QrCode, Monitor, X, Check, User, Tag, Printer
} from 'lucide-react';
import { toast } from 'sonner';
import InteractiveTiltCard from '@/components/ui/InteractiveTiltCard';
import PokaYokeModal from '@/components/ui/PokaYokeModal';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

export default function POSPage() {
  const { products, cart, addToCart, removeFromCart, updateCartQty, clearCart, currentUser, customers, addTransaction, addAuditLog, settings, categories } = useStore();
  const { formatRupiah, generateInvoiceNumber, generateId, formatDate } = useFormat();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [paidAmount, setPaidAmount] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [discount, setDiscount] = useState(0);
  
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<Transaction | null>(null);
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());
  const inputRef = useRef<HTMLInputElement>(null);
  const container = useRef<HTMLDivElement>(null);

  const [pokaYoke, setPokaYoke] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    product?: Product;
    maxQty?: number;
  }>({ isOpen: false, title: '', message: '' });

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const cartSummary = useMemo(() => {
    const subtotal = cart.reduce((s, item) => s + item.subtotal, 0);
    const totalDiscount = discount;
    const taxableAmount = subtotal - totalDiscount;
    const totalTax = settings.taxRate > 0 ? Math.round(taxableAmount * settings.taxRate / 100) : 0;
    const total = taxableAmount + totalTax;
    return { subtotal, totalDiscount, totalTax, total };
  }, [cart, discount, settings.taxRate]);

  const finalTotal = useMemo(() => {
    if (paymentMethod === 'cash') {
      return Math.round(cartSummary.total / 100) * 100;
    }
    return cartSummary.total;
  }, [cartSummary.total, paymentMethod]);

  const handleAddToCartWithValidation = useCallback((product: Product, qty = 1) => {
    const existingInCart = cart.find(i => i.productId === product.id);
    const currentCartQty = existingInCart ? existingInCart.quantity : 0;
    if (currentCartQty + qty > product.currentStock) {
      setPokaYoke({
        isOpen: true,
        title: 'Stok Tidak Mencukupi!',
        message: `Stok ${product.name} tersisa ${product.currentStock} ${product.unit}. Anda mencoba mengambil total ${currentCartQty + qty}.`,
        product,
        maxQty: product.currentStock,
      });
      return;
    }
    addToCart(product, qty);
    toast.success(`${product.name} ditambahkan ke keranjang`);
  }, [cart, addToCart]);

  // Barcode Scanner & Global POS Keyboard Shortcuts
  useEffect(() => {
    let barcodeBuffer = '';
    let lastKeyTime = Date.now();

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Handle F1, F2, F4, Esc shortcuts
      if (e.key === 'F1') {
        e.preventDefault();
        inputRef.current?.focus();
        toast.info('Shortcut: Search Focus');
        return;
      }
      if (e.key === 'F2') {
        e.preventDefault();
        if (cart.length > 0) {
          clearCart();
          toast.info('Shortcut: Keranjang dikosongkan');
        }
        return;
      }
      if (e.key === 'F4') {
        e.preventDefault();
        if (cart.length > 0 && !showPayment) {
          setShowPayment(true);
          setPaidAmount('');
          toast.info('Shortcut: Buka Pembayaran');
        }
        return;
      }
      if (e.key === 'F8') {
        e.preventDefault();
        if (showPayment && paymentMethod === 'cash') {
          setPaidAmount(finalTotal.toString());
          toast.info('Shortcut: Uang Pas');
        }
        return;
      }
      if (e.key === 'Escape') {
        if (showPayment) {
          setShowPayment(false);
          toast.info('Shortcut: Pembayaran Dibatalkan');
        } else if (searchQuery) {
          setSearchQuery('');
        }
        return;
      }

      // Ignore if active element is text input or textarea
      if (document.activeElement instanceof HTMLInputElement || document.activeElement instanceof HTMLTextAreaElement) {
        return;
      }

      const currentTime = Date.now();
      if (currentTime - lastKeyTime > 50) {
        barcodeBuffer = '';
      }
      lastKeyTime = currentTime;

      if (e.key === 'Enter') {
        if (barcodeBuffer.length >= 3) {
          const matched = products.find(p => p.isActive && (p.barcode === barcodeBuffer || p.sku.toLowerCase() === barcodeBuffer.toLowerCase()));
          if (matched) {
            handleAddToCartWithValidation(matched);
            toast.success(`Scanned: ${matched.name}`);
          } else {
            toast.error(`Produk dengan barcode/SKU "${barcodeBuffer}" tidak ditemukan`);
          }
        }
        barcodeBuffer = '';
      } else if (e.key.length === 1) {
        barcodeBuffer += e.key;
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, [products, handleAddToCartWithValidation, showPayment, searchQuery, cart, finalTotal, paymentMethod, clearCart]);

  const filteredProducts = useMemo(() => {
    let result = products.filter(p => p.isActive);
    if (selectedCategory !== 'all') {
      result = result.filter(p => p.categoryId === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.barcode?.includes(q)
      );
    }
    return result;
  }, [products, selectedCategory, searchQuery]);

  useGSAP(() => {
    if (filteredProducts.length > 0) {
      gsap.fromTo('.product-card-anim', 
        { y: 40, opacity: 0, scale: 0.9 }, 
        { y: 0, opacity: 1, scale: 1, duration: 0.4, stagger: 0.05, ease: 'back.out(1.5)', clearProps: 'all' }
      );
    }
  }, { scope: container, dependencies: [filteredProducts] });



  const change = useMemo(() => {
    const paid = parseInt(paidAmount.replace(/\D/g, '')) || 0;
    return paid - finalTotal;
  }, [paidAmount, finalTotal]);

  const handleCheckout = () => {
    if (cart.length === 0) return;

    const transaction: Transaction = {
      id: generateId('T'),
      invoiceNumber: generateInvoiceNumber(settings.invoicePrefix),
      customerId: selectedCustomer || undefined,
      customerName: selectedCustomer ? customers.find(c => c.id === selectedCustomer)?.name : undefined,
      cashierId: currentUser!.id,
      cashierName: currentUser!.name,
      items: cart.map(item => ({
        id: generateId('TI'),
        transactionId: '',
        productId: item.productId,
        productName: item.product.name,
        sku: item.product.sku,
        quantity: item.quantity,
        price: item.product.sellingPrice,
        costPrice: item.product.purchasePrice,
        discount: item.discount,
        subtotal: item.subtotal,
      })),
      subtotal: cartSummary.subtotal,
      discount: cartSummary.totalDiscount,
      tax: cartSummary.totalTax,
      taxRate: settings.taxRate,
      total: finalTotal,
      paymentMethod,
      paidAmount: paymentMethod === 'cash' ? (parseInt(paidAmount.replace(/\D/g, '')) || finalTotal) : finalTotal,
      change: paymentMethod === 'cash' ? Math.max(0, change) : 0,
      isVoided: false,
      createdAt: new Date().toISOString(),
    };

    transaction.items = transaction.items.map(i => ({ ...i, transactionId: transaction.id }));

    addTransaction(transaction);
    addAuditLog({
      id: generateId('AL'),
      action: 'TRANSACTION_COMPLETE',
      entityType: 'transaction',
      entityId: transaction.id,
      newValue: JSON.stringify({ invoice: transaction.invoiceNumber, total: transaction.total }),
      userId: currentUser!.id,
      userName: currentUser!.name,
      createdAt: new Date().toISOString(),
    });

    toast.success(`Transaksi ${transaction.invoiceNumber} Berhasil!`);
    setLastTransaction(transaction);
    setShowPayment(false);
    setShowReceipt(true);
    setPaidAmount('');
    setDiscount(0);
    setSelectedCustomer('');
  };

  const handleKeypad = (key: string) => {
    if (key === 'C') {
      setPaidAmount('');
    } else if (key === 'enter') {
      if (showPayment && change >= 0) handleCheckout();
    } else {
      setPaidAmount(prev => {
        const clean = prev.replace(/\D/g, '');
        const newVal = clean + key;
        return newVal;
      });
    }
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      const keyMap: Record<string, string> = {
        '1': '1', '2': '2', '3': '3', '4': '4', '5': '5',
        '6': '6', '7': '7', '8': '8', '9': '9', '0': '0',
        'Backspace': 'C', 'Enter': 'enter',
      };
      if (keyMap[e.key]) {
        setActiveKeys(prev => new Set(prev).add(keyMap[e.key]));
        handleKeypad(keyMap[e.key]);
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      const keyMap: Record<string, string> = {
        '1': '1', '2': '2', '3': '3', '4': '4', '5': '5',
        '6': '6', '7': '7', '8': '8', '9': '9', '0': '0',
        'Backspace': 'C', 'Enter': 'enter',
      };
      if (keyMap[e.key]) {
        setActiveKeys(prev => {
          const next = new Set(prev);
          next.delete(keyMap[e.key]);
          return next;
        });
      }
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [showPayment, finalTotal, change]);

  const quickAmounts = [5000, 10000, 20000, 50000, 100000];

  return (
    <div className="h-full flex flex-col lg:flex-row gap-4">
      {/* Left - Product Catalog */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Search & Categories */}
        <div className="mb-4 space-y-3">
          {/* Quick Keyboard Shortcut Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] text-slate-500 dark:text-slate-400">
            <span className="font-semibold text-slate-400">Shortcuts:</span>
            <span className="px-2 py-0.5 rounded bg-slate-200/60 dark:bg-slate-800 font-mono font-bold text-slate-700 dark:text-slate-300">F1 Cari</span>
            <span className="px-2 py-0.5 rounded bg-slate-200/60 dark:bg-slate-800 font-mono font-bold text-slate-700 dark:text-slate-300">F2 Hapus Cart</span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-mono font-bold">F4 Bayar</span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-mono font-bold">F8 Uang Pas</span>
            <span className="px-2 py-0.5 rounded bg-slate-200/60 dark:bg-slate-800 font-mono font-bold text-slate-700 dark:text-slate-300">Esc Batal</span>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Cari produk (F1)... [Nama, SKU, Barcode]"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pos-input w-full pl-10"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 pos-scrollbar">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === 'all'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 border border-emerald-500/20'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              Semua
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 border border-emerald-500/20'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto pos-scrollbar -mx-1 px-1" ref={container}>
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500">Produk tidak ditemukan</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 overflow-hidden p-1">
              {filteredProducts.map(product => (
                <div key={product.id} className="product-card-anim">
                  <ProductCard
                    product={product}
                    onClick={() => handleAddToCartWithValidation(product)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right - Cart */}
      <div className="w-full lg:w-[400px] xl:w-[440px] flex-shrink-0 pos-card flex flex-col max-h-[calc(100vh-120px)]">
        {/* Cart Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-emerald-600 dark:text-emerald-500" />
              Keranjang ({cart.length})
            </h3>
            {cart.length > 0 && (
              <button onClick={clearCart} className="pos-btn-danger text-xs py-1.5 px-2.5">
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Customer Select */}
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              value={selectedCustomer}
              onChange={e => setSelectedCustomer(e.target.value)}
              className="pos-input w-full pl-10 text-sm appearance-none cursor-pointer"
            >
              <option value="">Pelanggan Umum</option>
              {customers.filter(c => c.isActive).map(c => (
                <option key={c.id} value={c.id}>{c.name} - {c.membership.toUpperCase()}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto pos-scrollbar p-3 space-y-2">
          {cart.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCartEmpty />
              <p className="text-gray-500 text-sm mt-2">Keranjang kosong</p>
              <p className="text-gray-600 text-xs">Klik produk untuk menambahkan</p>
            </div>
          ) : (
            cart.map(item => (
              <CartItemRow
                key={item.productId}
                item={item}
                onUpdateQty={updateCartQty}
                onRemove={removeFromCart}
              />
            ))
          )}
        </div>

        {/* Cart Summary */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Subtotal</span>
            <span className="text-slate-900 dark:text-slate-100 font-mono">{formatRupiah(cartSummary.subtotal)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">Diskon (Rp)</span>
            <input
              type="text"
              value={discount === 0 ? '' : discount}
              onChange={e => setDiscount(parseInt(e.target.value.replace(/\D/g, '')) || 0)}
              placeholder="0"
              className="pos-input text-right w-28 py-1 px-2 text-rose-500 font-mono h-8 border-transparent hover:border-slate-300 dark:hover:border-slate-600 bg-transparent hover:bg-white dark:hover:bg-slate-900 focus:bg-white dark:focus:bg-slate-900 transition-all"
            />
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Pajak ({settings.taxRate}%)</span>
            <span className="text-slate-400 font-mono">{formatRupiah(cartSummary.totalTax)}</span>
          </div>
          <div className="border-t border-slate-200 dark:border-slate-800 pt-2 flex justify-between">
            <span className="text-base font-semibold text-slate-900 dark:text-slate-100">Total</span>
            <span className="text-xl font-bold text-emerald-600 dark:text-emerald-500 font-mono">{formatRupiah(cartSummary.total)}</span>
          </div>

          {/* Pay Button */}
          <button
            onClick={() => {
              if (cart.length > 0) {
                setShowPayment(true);
                setPaidAmount('');
              }
            }}
            disabled={cart.length === 0}
            className="pos-btn-primary w-full py-3 text-base flex items-center justify-center gap-2 disabled:opacity-30 mt-2"
          >
            <CreditCard className="w-5 h-5" />
            Bayar
          </button>
        </div>
      </div>

      {/* Payment Modal */}
      {showPayment && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="pos-card w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Pembayaran</h3>
              <button onClick={() => setShowPayment(false)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Total Display */}
            <div className="text-center mb-5 p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 relative">
              <p className="text-sm text-slate-500">Total Pembayaran</p>
              <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-500 font-mono mt-1">{formatRupiah(finalTotal)}</p>
              {paymentMethod === 'cash' && finalTotal !== cartSummary.total && (
                <p className="text-[10px] text-slate-400 mt-1 absolute bottom-1 right-2">
                  *Dibulatkan dari {formatRupiah(cartSummary.total)}
                </p>
              )}
            </div>

            {/* Payment Methods */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              {[
                { key: 'cash', label: 'Tunai', icon: Banknote },
                { key: 'qris', label: 'QRIS', icon: QrCode },
                { key: 'debit', label: 'Debit', icon: CreditCard },
                { key: 'transfer', label: 'Transfer', icon: Monitor },
              ].map(pm => (
                <button
                  key={pm.key}
                  onClick={() => setPaymentMethod(pm.key as PaymentMethod)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-all ${
                    paymentMethod === pm.key
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-500'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  <pm.icon className="w-5 h-5" />
                  <span className="text-[10px] font-medium">{pm.label}</span>
                </button>
              ))}
            </div>

            {paymentMethod === 'cash' ? (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-200">
                {/* Amount Input */}
                <div className="mb-4">
                  <label className="block text-sm text-slate-500 mb-1.5">Jumlah Dibayar</label>
                  <input
                    type="text"
                    value={paidAmount ? formatRupiah(parseInt(paidAmount.replace(/\D/g, '')) || 0) : ''}
                    onChange={e => setPaidAmount(e.target.value.replace(/\D/g, ''))}
                    placeholder="0"
                    className="pos-input w-full text-lg font-mono text-center bg-slate-50 dark:bg-slate-900 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all"
                  />
                </div>

                {/* Quick Amounts */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <button
                    onClick={() => setPaidAmount(finalTotal.toString())}
                    className="px-2 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-600 dark:text-emerald-500 hover:bg-emerald-500/20 transition-all active:scale-95 flex flex-col items-center justify-center gap-0.5"
                  >
                    <span>Uang Pas</span>
                    <span className="text-[9px] opacity-70 font-mono">F8</span>
                  </button>
                  {quickAmounts.map(amt => (
                    <button
                      key={amt}
                      onClick={() => {
                        const current = parseInt(paidAmount) || 0;
                        setPaidAmount((current + amt).toString());
                      }}
                      className="px-2 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all active:scale-95"
                    >
                      {formatRupiah(amt)}
                    </button>
                  ))}
                </div>

                {/* Change */}
                {paidAmount && (
                  <div className={`text-center mb-4 p-3 rounded-xl border transition-colors ${change >= 0 ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-rose-500/5 border-rose-500/10'}`}>
                    <p className="text-sm text-slate-500">Kembalian</p>
                    <p className={`text-2xl font-bold font-mono ${change >= 0 ? 'text-emerald-600 dark:text-emerald-500' : 'text-rose-500'}`}>
                      {formatRupiah(Math.abs(change))}
                    </p>
                  </div>
                )}

                {/* POS Keypad */}
                <div className="pos-keyboard-container mb-4 py-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                  <ul className="pos-keyboard">
                    {['1', '2', '3', '4', '5', '6', '7', '8', '9', '00', '0', 'C'].map(key => (
                      <li
                        key={key}
                        data-key={key}
                        className={`pos-key ${activeKeys.has(key) ? 'active' : ''} ${key === 'C' ? 'pos-key-red' : ''}`}
                        onClick={() => handleKeypad(key)}
                      >
                        <span>{key === 'C' ? 'Clear' : key}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="animate-in fade-in zoom-in-95 duration-200">
                <div className="text-center py-10 mb-6 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                  {paymentMethod === 'qris' && (
                    <>
                      <div className="w-20 h-20 mx-auto mb-4 bg-white p-2 rounded-xl shadow-sm border border-slate-200">
                        <QrCode className="w-full h-full text-slate-800" />
                      </div>
                      <p className="text-base font-semibold text-slate-900 dark:text-slate-100">Menunggu Pembayaran QRIS</p>
                      <p className="text-sm text-slate-500 mt-1">Minta pelanggan scan kode QR di layar</p>
                    </>
                  )}
                  {paymentMethod === 'debit' && (
                    <>
                      <div className="w-16 h-16 mx-auto mb-4 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center">
                        <CreditCard className="w-8 h-8 text-slate-600 dark:text-slate-300" />
                      </div>
                      <p className="text-base font-semibold text-slate-900 dark:text-slate-100">Pembayaran Kartu Debit</p>
                      <p className="text-sm text-slate-500 mt-1">Lakukan transaksi pada mesin EDC</p>
                    </>
                  )}
                  {paymentMethod === 'transfer' && (
                    <>
                      <div className="w-16 h-16 mx-auto mb-4 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center">
                        <Monitor className="w-8 h-8 text-slate-600 dark:text-slate-300" />
                      </div>
                      <p className="text-base font-semibold text-slate-900 dark:text-slate-100">Transfer Bank</p>
                      <p className="text-sm text-slate-500 mt-1">Tunggu konfirmasi dana masuk</p>
                    </>
                  )}
                  <div className="mt-4 inline-block px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <p className="text-xs text-slate-500 mb-0.5">Total Tagihan</p>
                    <p className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-500">{formatRupiah(finalTotal)}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Confirm Button */}
            <button
              onClick={handleCheckout}
              disabled={paymentMethod === 'cash' && (change < 0 || !paidAmount)}
              className="pos-btn-primary w-full py-4 text-base font-semibold flex items-center justify-center gap-2 disabled:opacity-30 shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all"
            >
              <Check className="w-5 h-5" />
              {paymentMethod === 'cash' ? 'Konfirmasi Pembayaran' : 'Transaksi Selesai'}
            </button>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceipt && lastTransaction && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="pos-card receipt-print w-full max-w-sm p-6">
            <div className="text-center mb-5">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{settings.storeName}</h3>
              <p className="text-xs text-slate-500">{settings.storeAddress}</p>
              <p className="text-xs text-slate-500">{settings.storePhone}</p>
            </div>

            <div className="border-t border-b border-slate-200 dark:border-slate-700 py-3 mb-3 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">No. Invoice</span>
                <span className="text-slate-900 dark:text-slate-100 font-mono">{lastTransaction.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tanggal</span>
                <span className="text-slate-900 dark:text-slate-100">{formatDate(lastTransaction.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Kasir</span>
                <span className="text-slate-900 dark:text-slate-100">{lastTransaction.cashierName}</span>
              </div>
            </div>

            <div className="space-y-2 mb-3">
              {lastTransaction.items.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <div>
                    <span className="text-slate-900 dark:text-slate-100">{item.productName}</span>
                    <span className="text-slate-500 ml-1">x{item.quantity}</span>
                  </div>
                  <span className="text-slate-900 dark:text-slate-100 font-mono">{formatRupiah(item.subtotal)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-200 dark:border-slate-700 pt-3 space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Subtotal</span>
                <span className="text-slate-900 dark:text-slate-100 font-mono">{formatRupiah(lastTransaction.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Diskon</span>
                <span className="text-rose-500 font-mono">-{formatRupiah(lastTransaction.discount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Pajak</span>
                <span className="text-slate-400 font-mono">{formatRupiah(lastTransaction.tax)}</span>
              </div>
              <div className="flex justify-between text-base font-semibold pt-1 border-t border-slate-200 dark:border-slate-700">
                <span className="text-slate-900 dark:text-slate-100">TOTAL</span>
                <span className="text-emerald-600 dark:text-emerald-500 font-mono">{formatRupiah(lastTransaction.total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Bayar ({lastTransaction.paymentMethod.toUpperCase()})</span>
                <span className="text-slate-900 dark:text-slate-100 font-mono">{formatRupiah(lastTransaction.paidAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Kembalian</span>
                <span className="text-emerald-600 dark:text-emerald-500 font-mono">{formatRupiah(lastTransaction.change)}</span>
              </div>
            </div>

            {settings.receiptFooter && (
              <p className="text-center text-xs text-gray-600 mt-4 whitespace-pre-line">{settings.receiptFooter}</p>
            )}

            <div className="grid grid-cols-2 gap-3 mt-5">
              <button
                onClick={() => window.print()}
                className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium text-sm flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all active:scale-[0.98]"
              >
                <Printer className="w-4 h-4" />
                Cetak Struk
              </button>
              <button
                onClick={() => setShowReceipt(false)}
                className="pos-btn-primary w-full py-2.5 flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
              >
                <Plus className="w-4 h-4" />
                Transaksi Baru
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Poka-Yoke Modal */}
      <PokaYokeModal
        isOpen={pokaYoke.isOpen}
        onClose={() => setPokaYoke({ ...pokaYoke, isOpen: false })}
        title={pokaYoke.title}
        message={pokaYoke.message}
        type="warning"
        autoFixAction={pokaYoke.product ? {
          label: `Otomatis Masukkan ${pokaYoke.maxQty} (Max)`,
          onClick: () => {
            if (pokaYoke.product && pokaYoke.maxQty) {
              updateCartQty(pokaYoke.product.id, pokaYoke.maxQty);
              toast.success(`Jumlah disesuaikan ke stok maksimal (${pokaYoke.maxQty})`);
            }
          }
        } : undefined}
      />
    </div>
  );
}

function ProductCard({ product, onClick }: { product: Product; onClick: () => void }) {
  const { formatRupiah } = useFormat();
  return (
    <InteractiveTiltCard
      onClick={onClick}
      className="pos-card p-3 text-left hover:border-emerald-500/40 transition-all group active:scale-[0.97]"
    >
      <div className="aspect-square rounded-lg bg-slate-50 dark:bg-slate-800/80 mb-2.5 overflow-hidden flex items-center justify-center relative">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-contain p-2 group-hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <Tag className="w-8 h-8 text-slate-400 dark:text-slate-500 group-hover:scale-110 transition-transform duration-300" />
        )}
      </div>
      <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate group-hover:text-emerald-500 transition-colors">{product.name}</p>
      <p className="text-xs text-slate-500">{product.sku}</p>
      <p className="text-sm font-mono font-semibold text-emerald-600 dark:text-emerald-400 mt-1">{formatRupiah(product.sellingPrice)}</p>
      {product.currentStock <= product.minStock && (
        <span className="pos-badge-red text-[10px] mt-1.5 inline-flex">
          Stok: {product.currentStock}
        </span>
      )}
    </InteractiveTiltCard>
  );
}

function CartItemRow({ item, onUpdateQty, onRemove }: {
  item: CartItem;
  onUpdateQty: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
}) {
  const { formatRupiah } = useFormat();
  return (
    <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
      <div className="w-10 h-10 rounded-lg bg-white dark:bg-slate-900 flex items-center justify-center flex-shrink-0 overflow-hidden">
        {item.product.imageUrl ? (
          <img src={item.product.imageUrl} alt="" className="w-full h-full object-contain p-1" />
        ) : (
          <Tag className="w-4 h-4 text-slate-400 dark:text-slate-500" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-900 dark:text-slate-100 truncate">{item.product.name}</p>
        <p className="text-xs text-slate-500">{formatRupiah(item.product.sellingPrice)} x {item.quantity}</p>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onUpdateQty(item.productId, item.quantity - 1)}
          className="w-7 h-7 rounded-md bg-white dark:bg-slate-900 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 border border-slate-200 dark:border-slate-700"
        >
          <Minus className="w-3 h-3" />
        </button>
        <input
          type="text"
          value={item.quantity}
          onChange={e => {
            const val = parseInt(e.target.value.replace(/\D/g, ''));
            if (!isNaN(val) && val > 0) onUpdateQty(item.productId, val);
            else if (e.target.value === '') onUpdateQty(item.productId, 0); // Allow empty temporarily
          }}
          onBlur={() => {
             if (item.quantity === 0) onUpdateQty(item.productId, 1);
          }}
          className="w-10 text-center text-sm font-mono text-slate-900 dark:text-slate-100 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-emerald-500 focus:outline-none transition-colors"
        />
        <button
          onClick={() => onUpdateQty(item.productId, item.quantity + 1)}
          className="w-7 h-7 rounded-md bg-white dark:bg-slate-900 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 border border-slate-200 dark:border-slate-700"
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>
      <div className="text-right min-w-[80px]">
        <p className="text-sm font-mono text-emerald-600 dark:text-emerald-500">{formatRupiah(item.subtotal)}</p>
      </div>
      <button
        onClick={() => onRemove(item.productId)}
        className="p-1.5 rounded-md hover:bg-rose-500/10 text-slate-400 hover:text-rose-500"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

function ShoppingCartEmpty() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="mx-auto text-gray-700">
      <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
