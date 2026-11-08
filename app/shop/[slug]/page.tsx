'use client';

import { ShopPortalSkeleton } from '@/components/skeleton';
import { ErrorState } from '@/components/error-state';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { applyTheme } from '@/lib/theme';
import { useAuth } from '@/lib/auth-context';
import { acceptFor } from '@/lib/file-types';
import { LogoMark } from '@/components/logo';
import { paymentOptions, paymentInstructions } from '@/lib/payments';
import { formatCurrency, formatFileSize, getTimeRemaining } from '@/lib/utils';
import { Upload, FileText, X, Printer, Check, Loader2 } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import type { Shop, PriceBreakdown } from '@/types';

const inputClass = "block w-full h-11 sm:h-10 rounded-xl border border-input bg-card px-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary transition-shadow";
const selectClass = "block w-full h-11 sm:h-10 rounded-xl border border-input bg-card px-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary transition-shadow";

async function detectPdfPages(file: File): Promise<number> {
  if (!file.name.toLowerCase().endsWith('.pdf')) return 1;
  try {
    const text = await file.text();
    const m = text.match(/\/Type\s*\/Page(?![a-zA-Z])/g);
    return m && m.length > 0 ? m.length : 1;
  } catch {
    return 1;
  }
}

export default function CustomerPortal() {
  const { slug } = useParams();
  const { user } = useAuth();
  const [shop, setShop] = useState<Shop | null>(null);
  const [files, setFiles] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [orderForm, setOrderForm] = useState({
    customerName: '', customerEmail: '', customerPhone: '',
    paymentMethod: '',
    scheduledPickup: '',
  });
  const [printOptions, setPrintOptions] = useState<Record<string, any>>({});
  const [pricing, setPricing] = useState<PriceBreakdown | null>(null);
  const [orderResult, setOrderResult] = useState<any>(null);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [page, setPage] = useState<'upload' | 'options' | 'review' | 'done'>('upload');

  useEffect(() => {
    if (user?.role === 'CUSTOMER') {
      setOrderForm((f) => ({ ...f, customerName: f.customerName || user.name, customerEmail: f.customerEmail || user.email, customerPhone: f.customerPhone || user.phone || '' }));
    }
  }, [user]);

  const [shopLoading, setShopLoading] = useState(true);
  const [shopError, setShopError] = useState<{ message: string; notFound: boolean } | null>(null);

  const loadShop = useCallback(() => {
    if (!slug) return;
    setShopLoading(true);
    setShopError(null);
    api.shops.bySlug(slug as string)
      .then((s) => {
        setShop(s);
        if (s.branding) applyTheme(s.branding);
      })
      .catch((e) => setShopError({ message: e?.message || 'Could not load this shop', notFound: e?.status === 404 }))
      .finally(() => setShopLoading(false));
  }, [slug]);

  useEffect(() => {
    loadShop();
  }, [loadShop]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!shop) return;
    setUploading(true);
    setError('');
    for (const file of acceptedFiles) {
      try {
        const [upload, pageCount] = await Promise.all([api.uploads.upload(shop.id, file), detectPdfPages(file)]);
        setFiles((prev) => [...prev, { ...upload, progress: 100 }]);
        setPrintOptions((prev) => ({
          ...prev,
          [upload.id]: {
            fileName: upload.originalName, pageCount, copies: 1,
            colorMode: 'BLACK_WHITE', paperSize: 'A4', layout: 'SINGLE_SIDED',
            printQuality: 'STANDARD', bindingType: 'NONE', finishingType: 'NONE',
          },
        }));
      } catch (err: any) {
        setError(`${file.name}: ${err.message || 'Upload failed'}`);
      }
    }
    setUploading(false);
  }, [shop]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, disabled: uploading || !shop || shop.isAcceptingOrders === false,
    accept: acceptFor(shop?.allowedFileTypes) ?? {
      'application/pdf': ['.pdf'], 'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-powerpoint': ['.ppt', '.pptx'],
      'application/vnd.ms-excel': ['.xls', '.xlsx'],
      'image/*': ['.jpg', '.png'], 'application/zip': ['.zip'],
    },
  });

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    const opts = { ...printOptions };
    delete opts[id];
    setPrintOptions(opts);
  };

  const updateOption = (fileId: string, key: string, value: any) => {
    setPrintOptions((prev) => ({ ...prev, [fileId]: { ...prev[fileId], [key]: value } }));
  };

  const calculatePrice = async () => {
    if (!shop || files.length === 0) return;
    const items = files.map((f) => ({
      pageCount: printOptions[f.id]?.pageCount || 1,
      copies: printOptions[f.id]?.copies || 1,
      colorMode: printOptions[f.id]?.colorMode || 'BLACK_WHITE',
      paperSize: printOptions[f.id]?.paperSize || 'A4',
      bindingType: printOptions[f.id]?.bindingType || 'NONE',
      finishingType: printOptions[f.id]?.finishingType || 'NONE',
    }));
    setError('');
    try {
      const price = await api.pricing.calculate(shop.id, items);
      setPricing(price);
      setPage('review');
    } catch (err: any) {
      setError(err.message || 'Could not calculate the price');
    }
  };

  const createOrder = async () => {
    if (!shop) return;
    setCreatingOrder(true);
    try {
      const order = await api.orders.create({
        shopId: shop.id,
        customerName: orderForm.customerName || undefined,
        customerEmail: orderForm.customerEmail || undefined,
        customerPhone: orderForm.customerPhone || undefined,
        paymentMethod: orderForm.paymentMethod || paymentOptions(shop)[0].value,
        scheduledPickup: orderForm.scheduledPickup || undefined,
        items: files.map((f) => ({
          uploadId: f.id, fileName: f.originalName, fileSize: f.fileSize,
          pageCount: printOptions[f.id]?.pageCount || 1,
          copies: printOptions[f.id]?.copies || 1,
          colorMode: printOptions[f.id]?.colorMode || 'BLACK_WHITE',
          paperSize: printOptions[f.id]?.paperSize || 'A4',
          layout: printOptions[f.id]?.layout || 'SINGLE_SIDED',
          printQuality: printOptions[f.id]?.printQuality || 'STANDARD',
          bindingType: printOptions[f.id]?.bindingType || 'NONE',
          finishingType: printOptions[f.id]?.finishingType || 'NONE',
        })),
      });
      setOrderResult(order);

      setPage('done');
    } catch (err: any) {
      setError(err.message || 'Could not place the order');
    } finally {
      setCreatingOrder(false);
    }
  };

  const firstDelete = files.find((f) => f.deleteAfter)?.deleteAfter;
  const retentionLabel = firstDelete ? getTimeRemaining(firstDelete) : '1 hour';

  if (shopLoading) return <ShopPortalSkeleton />;

  if (!shop) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        {shopError && !shopError.notFound ? (
          <ErrorState title="Couldn't load this shop" message={shopError.message} onRetry={loadShop} />
        ) : (
          <div className="text-center">
            <Printer className="h-10 w-10 text-foreground/30 mx-auto mb-3" />
            <h2 className="text-lg font-semibold">Shop not found</h2>
            <p className="text-sm text-foreground/60">This print shop doesn&apos;t exist or is inactive.</p>
          </div>
        )}
      </div>
    );
  }

  if (page === 'done' && orderResult) {
    return (
      <div className="light-brand min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: shop.branding?.backgroundColor || '#fff' }}>
        <div className="max-w-sm w-full text-center space-y-6 bg-card rounded-xl p-8 shadow-lg border">
          <div className="h-14 w-14 rounded-full bg-green-50 border border-green-100 flex items-center justify-center mx-auto">
            <Check className="h-7 w-7 text-green-600" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Order placed!</h1>
            <p className="text-3xl font-bold text-primary mt-2 tracking-tight">{orderResult.orderNumber}</p>
            <p className="text-xs text-foreground/60 mt-1">Save this order number</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-4 text-xs space-y-2 text-left">
            <div className="flex justify-between"><span className="text-foreground/60">Total</span><span className="font-semibold">{formatCurrency(orderResult.totalAmount)}</span></div>
            <div className="flex justify-between"><span className="text-foreground/60">Status</span><Badge>{orderResult.status}</Badge></div>
            {orderResult.estimatedCompletion && (
              <div className="flex justify-between"><span className="text-foreground/60">Ready in about</span><span>{Math.max(1, Math.round((new Date(orderResult.estimatedCompletion).getTime() - new Date(orderResult.createdAt || Date.now()).getTime()) / 60000))} min</span></div>
            )}
          </div>
          <div className="bg-primary/10 border border-primary/20 text-foreground text-xs p-3 rounded-xl text-left space-y-1">
            <p className="font-semibold">How to pay</p>
            {paymentInstructions(shop, orderResult.paymentMethod || orderForm.paymentMethod, orderResult.totalAmount).map((l, i) => <p key={i}>{l}</p>)}
            <p className="text-foreground/60 pt-1">Show your order number to the cashier when you pay.</p>
          </div>
          <p className="text-[11px] text-foreground/50">For your security, your files are permanently deleted from our servers one hour after your order is ready.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="light-brand min-h-screen" style={{ backgroundColor: shop.branding?.backgroundColor || '#fff' }}>
      <style>{`.qp-shop button { border-radius: ${shop.branding?.buttonStyle === 'pill' ? '9999px' : shop.branding?.buttonStyle === 'square' ? '0' : '0.5rem'}; }`}</style>
      <div className="qp-shop max-w-lg mx-auto px-4 py-6 space-y-6">
        <div className="text-center mb-2">
          {shop.branding?.logoUrl
            ? <img src={shop.branding.logoUrl} alt="" className="h-12 w-12 rounded-xl mx-auto mb-3 object-cover" />
            : <LogoMark className="h-12 w-12 mx-auto mb-3" />}
          <h1 className="text-lg font-semibold tracking-tight" style={{ color: shop.branding?.primaryColor }}>{shop.name}</h1>
          <p className="text-sm text-foreground/60">{shop.welcomeMessage || 'Upload your documents for printing'}</p>
        </div>

        <div className="flex gap-2 mb-4">
          {['upload', 'options', 'review'].map((p) => (
            <div key={p} className={`flex-1 h-1 rounded-full ${page === p ? 'bg-primary' : 'bg-muted'}`} />
          ))}
        </div>

        {shop.isAcceptingOrders === false && (
          <div className="bg-amber-50 border border-amber-200 text-amber-900 text-sm p-4 rounded-xl text-center">
            <p className="font-semibold">{shop.name} isn&apos;t taking new orders right now</p>
            <p className="text-xs mt-1 text-amber-800/80">Please check back a little later{shop.phone ? ` or call ${shop.phone}` : ''}.</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-700 text-sm p-3 rounded-xl">{error}</div>
        )}

        {page === 'upload' && (
          <div className="space-y-4">
            <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${isDragActive ? 'border-primary bg-primary/5' : 'border-foreground/20 hover:border-primary/40'}`}>
              <input {...getInputProps()} />
              <Upload className="h-10 w-10 text-foreground/30 mx-auto mb-3" />
              <p className="text-sm font-medium">Drop files here or click to browse</p>
              <p className="text-xs text-foreground/50 mt-1">PDF, DOC, DOCX, PPT, XLS, JPG, PNG, ZIP</p>
              <p className="text-[11px] text-foreground/40 mt-1">Your files go straight to {shop.name} and are permanently deleted one hour after your order is ready.</p>
              {uploading && <Loader2 className="h-5 w-5 animate-spin mx-auto mt-4 text-primary" />}
            </div>

            {files.length > 0 && (
              <div className="space-y-2">
                {files.map((file) => (
                  <div key={file.id} className="flex items-center gap-3 bg-card rounded-xl border p-4">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.originalName}</p>
                      <p className="text-xs text-foreground/50">{formatFileSize(file.fileSize)}</p>
                    </div>
                    {file.deleteAfter && (
                      <span className="text-xs text-orange-600 flex-shrink-0">{getTimeRemaining(file.deleteAfter)}</span>
                    )}
                    <button onClick={() => removeFile(file.id)} className="p-1 rounded-md hover:bg-muted text-foreground/40 hover:text-foreground transition-colors">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <Button className="w-full" size="lg" onClick={() => setPage('options')} disabled={uploading}>
                  Continue ({files.length} file{files.length > 1 ? 's' : ''})
                </Button>
              </div>
            )}
          </div>
        )}

        {page === 'options' && (
          <div className="space-y-4">
            {files.map((file) => {
              const opts = printOptions[file.id] || {};
              return (
                <div key={file.id} className="bg-card rounded-xl border p-5 space-y-4">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary flex-shrink-0" />
                    <span className="text-sm font-medium truncate">{file.originalName}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Color', key: 'colorMode', options: [{ v: 'BLACK_WHITE', l: 'B&W' }, { v: 'FULL_COLOR', l: 'Color' }] },
                      { label: 'Paper', key: 'paperSize', options: [{ v: 'A4', l: 'A4' }, { v: 'A3', l: 'A3' }, { v: 'LETTER', l: 'Letter' }, { v: 'LEGAL', l: 'Legal' }] },
                      { label: 'Layout', key: 'layout', options: [{ v: 'SINGLE_SIDED', l: 'Single' }, { v: 'DOUBLE_SIDED', l: 'Double' }] },
                      { label: 'Quality', key: 'printQuality', options: [{ v: 'DRAFT', l: 'Draft' }, { v: 'STANDARD', l: 'Standard' }, { v: 'HIGH_QUALITY', l: 'High' }] },
                      { label: 'Binding', key: 'bindingType', options: [{ v: 'NONE', l: 'None' }, { v: 'SPIRAL', l: 'Spiral' }, { v: 'COMB', l: 'Comb' }, { v: 'TAPE', l: 'Tape' }, { v: 'HARDCOVER', l: 'Hardcover' }] },
                      { label: 'Finishing', key: 'finishingType', options: [{ v: 'NONE', l: 'None' }, { v: 'STAPLING', l: 'Staple' }, { v: 'LAMINATION', l: 'Laminate' }, { v: 'FOLDING', l: 'Fold' }, { v: 'HOLE_PUNCH', l: 'Punch' }] },
                    ].map((field) => (
                      <div key={field.key}>
                        <label className="text-xs text-foreground/60 block mb-1.5">{field.label}</label>
                        <select
                          value={opts[field.key] || field.options[0].v}
                          onChange={(e) => updateOption(file.id, field.key, e.target.value)}
                          className={selectClass}
                        >
                          {field.options.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
                        </select>
                      </div>
                    ))}
                    <div>
                      <label className="text-xs text-foreground/60 block mb-1.5">Pages in document</label>
                      <input type="number" min="1" value={opts.pageCount || 1}
                        onChange={(e) => updateOption(file.id, 'pageCount', parseInt(e.target.value) || 1)}
                        className={inputClass} />
                    </div>
                    <div>
                      <label className="text-xs text-foreground/60 block mb-1.5">Copies</label>
                      <input type="number" min="1" value={opts.copies || 1}
                        onChange={(e) => updateOption(file.id, 'copies', parseInt(e.target.value) || 1)}
                        className={inputClass} />
                    </div>
                  </div>
                </div>
              );
            })}
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setPage('upload')} className="flex-1">Back</Button>
              <Button className="flex-[2]" onClick={calculatePrice}>Review order</Button>
            </div>
          </div>
        )}

        {page === 'review' && (
          <div className="space-y-4">
            <div className="bg-card rounded-xl border p-5 space-y-2">
              <h3 className="text-sm font-semibold mb-3">Order summary</h3>
              {files.map((file) => {
                const opts = printOptions[file.id] || {};
                return (
                  <div key={file.id} className="flex justify-between text-sm py-2 border-b border-border/50 last:border-0">
                    <span className="truncate text-foreground/80">{file.originalName} ({opts.copies || 1}x)</span>
                    <span className="text-foreground/50 ml-2 flex-shrink-0">{opts.colorMode === 'FULL_COLOR' ? 'Color' : 'B&W'}</span>
                  </div>
                );
              })}
            </div>

            {pricing && (
              <div className="bg-card rounded-xl border p-5 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-foreground/60">Printing</span>
                  <span>{formatCurrency(pricing.printingCost)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-foreground/60">Binding</span>
                  <span>{formatCurrency(pricing.bindingCost)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-foreground/60">Finishing</span>
                  <span>{formatCurrency(pricing.finishingCost)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-foreground/60">Tax (VAT)</span>
                  <span>{formatCurrency(pricing.taxAmount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-foreground/60">Service fee</span>
                  <span>{formatCurrency(pricing.serviceFee)}</span>
                </div>
                <div className="flex justify-between text-base font-semibold border-t pt-3 mt-3">
                  <span>Total</span>
                  <span style={{ color: shop.branding?.primaryColor }}>{formatCurrency(pricing.totalAmount)}</span>
                </div>
              </div>
            )}

            <div className="bg-card rounded-xl border p-5 space-y-4">
              <h3 className="text-sm font-semibold">Your details</h3>
              {[
                { label: 'Name', key: 'customerName', type: 'text', placeholder: 'John Doe' },
                { label: 'Email', key: 'customerEmail', type: 'email', placeholder: 'john@example.com' },
                { label: 'Phone', key: 'customerPhone', type: 'tel', placeholder: '+254 700 000 000' },
              ].map((field) => (
                <div key={field.key}>
                  <label className="text-xs text-foreground/60 block mb-1">{field.label}</label>
                  <input type={field.type} value={(orderForm as any)[field.key]}
                    onChange={(e) => setOrderForm({ ...orderForm, [field.key]: e.target.value })}
                    className={inputClass} placeholder={field.placeholder} />
                </div>
              ))}
              <div>
                <label className="text-xs text-foreground/60 block mb-1">Payment method</label>
                <select value={orderForm.paymentMethod || paymentOptions(shop)[0].value}
                  onChange={(e) => setOrderForm({ ...orderForm, paymentMethod: e.target.value })}
                  className={selectClass}>
                  {paymentOptions(shop).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-foreground/60 block mb-1">Schedule pickup (optional)</label>
                <input type="datetime-local" value={orderForm.scheduledPickup}
                  onChange={(e) => setOrderForm({ ...orderForm, scheduledPickup: e.target.value })}
                  className={inputClass} />
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setPage('options')} className="flex-1">Back</Button>
              <Button className="flex-[2]" size="lg" onClick={createOrder} disabled={creatingOrder}>
                {creatingOrder ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Processing...</>
                ) : (
                  `Place order - ${formatCurrency(pricing?.totalAmount || 0)}`
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
