import React, { useState } from 'react';

export default function StaffSales() {
  const [customerId, setCustomerId] = useState('');
  const [staffId, setStaffId] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [discount, setDiscount] = useState('');
  const [items, setItems] = useState([{ partId: '', quantity: '' }]);
  const [status, setStatus] = useState('');

  const handleAddItem = () => setItems([...items, { partId: '', quantity: '' }]);
  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };
  const handleRemoveItem = (index) => setItems(items.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Processing sale...');
    try {
      const payload = {
        customerId: parseInt(customerId),
        staffId: parseInt(staffId),
        totalAmount: parseFloat(totalAmount),
        discountApplied: parseFloat(discount) || 0,
        paymentStatus: 'Paid',
        invoiceItems: items.map(item => ({
          partId: parseInt(item.partId),
          quantity: parseInt(item.quantity)
        }))
      };

      const response = await fetch('http://localhost:5209/api/invoice/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const result = await response.json();
        setStatus(`Sale recorded successfully! Total: $${result.totalAmount.toFixed(2)}`);
        if (result.discountApplied > 0) {
            setStatus(prev => prev + ` (Loyalty Discount of $${result.discountApplied.toFixed(2)} applied)`);
        }
        setCustomerId('');
        setStaffId('');
        setTotalAmount('');
        setDiscount('');
        setItems([{ partId: '', quantity: '' }]);
      } else {
        const err = await response.text();
        setStatus(`Failed to record sale: ${err}`);
      }
    } catch (error) {
      console.error(error);
      setStatus('Error occurred connecting to the server.');
    }
  };

  return (
    <div className="route-card" style={{ maxWidth: '700px', margin: '0 auto' }}>
      <span className="route-eyebrow">Staff Panel</span>
      <h1 className="route-title" style={{ fontSize: '2.5rem' }}>Create Sales Invoice</h1>
      <p className="route-copy" style={{ marginBottom: '24px' }}>
        Record a customer purchase and update inventory stock levels.
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px' }}>Customer ID</label>
            <input
              type="number"
              value={customerId}
              onChange={e => setCustomerId(e.target.value)}
              required
              style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #ccc' }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px' }}>Staff ID</label>
            <input
              type="number"
              value={staffId}
              onChange={e => setStaffId(e.target.value)}
              required
              style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #ccc' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px' }}>Sub-Total ($)</label>
            <input
              type="number"
              step="0.01"
              value={totalAmount}
              onChange={e => setTotalAmount(e.target.value)}
              required
              placeholder="Total before loyalty discount"
              style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #ccc' }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px' }}>Extra Discount ($)</label>
            <input
              type="number"
              step="0.01"
              value={discount}
              onChange={e => setDiscount(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #ccc' }}
            />
          </div>
        </div>
        
        <p style={{ fontSize: '0.9rem', color: '#64748b', fontStyle: 'italic' }}>
            * Note: A 10% Loyalty Discount is automatically applied for purchases over $5000.
        </p>

        <div>
          <h3 style={{ fontWeight: 600, fontSize: '1.2rem', marginBottom: '12px' }}>Sale Items</h3>
          {items.map((item, index) => (
            <div key={index} style={{ display: 'flex', gap: '12px', marginBottom: '12px', alignItems: 'center' }}>
              <input
                type="number"
                placeholder="Part ID"
                value={item.partId}
                onChange={e => handleItemChange(index, 'partId', e.target.value)}
                required
                style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
              />
              <input
                type="number"
                placeholder="Qty"
                value={item.quantity}
                onChange={e => handleItemChange(index, 'quantity', e.target.value)}
                required
                style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
              />
              {items.length > 1 && (
                <button type="button" onClick={() => handleRemoveItem(index)} style={{ padding: '10px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600 }}>
                  X
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={handleAddItem} style={{ padding: '10px 16px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600 }}>
            + Add Item
          </button>
        </div>

        <button type="submit" style={{ padding: '16px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '1.1rem', fontWeight: 700, marginTop: '10px' }}>
          Record Sale & Generate Invoice
        </button>

        {status && <p style={{ marginTop: '12px', fontWeight: 600, color: status.includes('success') ? '#10b981' : '#ef4444' }}>{status}</p>}
      </form>
    </div>
  );
}
