// NeoCare Hospital Management System - Master Logic (Fixed Pharmacy)
const DEFAULT_STATE = {
    patients: [
        {id:'P1', name:'John Doe', bsn:'123456789', dob:'1985-05-15', gender:'Male', address:'123 Oak Lane', phone:'555-0101', email:'john@example.com', remark:'Stable', consults:[], investigations:[]},
        {id:'P2', name:'Jane Smith', bsn:'987654321', dob:'1990-08-22', gender:'Female', address:'456 Pine Ave', phone:'555-0202', email:'jane@example.com', remark:'Follow-up required', consults:[], investigations:[]}
    ],
    doctors: [
        {id:'D1', name:'Dr. Sarah Wilson', specialty:'Cardiology'},
        {id:'D2', name:'Dr. Mark Miller', specialty:'Pediatrics'}
    ],
    appointments: [
        {id:'A1', datetime:new Date(Date.now()+86400000).toISOString().slice(0,16), duration:30, pId:'P1', pName:'John Doe', dId:'D1', dName:'Dr. Sarah Wilson', deptId:'DE1', deptName:'Emergency', reason:'Heart checkup'}
    ],
    inventory: [
        {id:'I1', name:'Paracetamol', stock:500, unit:'Tablets'},
        {id:'I2', name:'Amoxicillin', stock:50, unit:'Boxes'}
    ],
    departments: [
        {id:'DE1', name:'Emergency', head:'Dr. Wilson'},
        {id:'DE2', name:'Radiology', head:'Dr. Evans'}
    ],
    billing: [
        {id:'INV-101', date:new Date().toISOString().split('T')[0], pId:'P1', pName:'John Doe', total:250, status:'Paid', items:[{desc:'General Consultation', amt:250}]},
        {id:'INV-102', date:new Date().toISOString().split('T')[0], pId:'P2', pName:'Jane Smith', total:1500, status:'Unpaid', items:[{desc:'MRI Scan', amt:1500}]}
    ],
    activity: [
        {id:1, text:'NeoCare System initialized with demo data', icon:'🚀', time:'09:00 AM'},
        {id:2, text:'Emergency department roster updated', icon:'📋', time:'10:30 AM'}
    ],
    settings: { 
        hospitalName: 'NeoCare General Hospital',
        currency: '$',
        defaultTax: 10
    }
};

let state = JSON.parse(localStorage.getItem('neoCareState')) || DEFAULT_STATE;
const save = () => localStorage.setItem('neoCareState', JSON.stringify(state));

// --- UI Helpers ---
function showModal(html) { document.getElementById('modal-container').innerHTML = html; document.getElementById('modal-overlay').classList.add('active'); }
function hideModal() { document.getElementById('modal-overlay').classList.remove('active'); }
window.hideModal = hideModal;

// --- Searchable Select ---
function createSearchSelect(label, id, list, currentId) {
    const cur = list.find(x => x.id === currentId);
    return `<div class="form-group"><label>${label}</label><div class="nm-input-container"><input type="text" id="${id}-search" class="nm-input" placeholder="Search..." value="${cur?cur.name:''}" oninput="fList('${id}',this.value)"><input type="hidden" id="${id}-val" value="${currentId||''}"></div><div id="${id}-l" class="nm-inset" style="max-height:100px; overflow-y:auto; display:none; margin-top:5px;">${list.map(i => `<div style="padding:8px; cursor:pointer;" onclick="selI('${id}','${i.id}','${i.name.replace(/'/g,"\\'")}')">${i.name}</div>`).join('')}</div></div>`;
}
window.fList = (id,q) => { const l = document.getElementById(`${id}-l`); l.style.display='block'; Array.from(l.children).forEach(i => i.style.display = i.innerText.toLowerCase().includes(q.toLowerCase())?'block':'none'); };
window.selI = (id,v,n) => { document.getElementById(`${id}-val`).value=v; document.getElementById(`${id}-search`).value=n; document.getElementById(`${id}-l`).style.display='none'; };

// --- Master Rendering ---
function render(view) {
    document.querySelectorAll('.nav-item').forEach(i => i.classList.toggle('active', i.getAttribute('data-view') === view));
    const c = document.getElementById('view-content');
    c.innerHTML = '';
    switch(view) {
        case 'dashboard': renderDashboard(c); break;
        case 'patients': renderPatients(c); break;
        case 'staff': renderStaff(c); break;
        case 'appointments': renderAppointments(c); break;
        case 'pharmacy': renderPharmacy(c); break;
        case 'billing': renderBilling(c); break;
        case 'departments': renderDepartments(c); break;
        case 'settings': renderSettings(c); break;
        default: renderDashboard(c);
    }
}
window.switchView = render;

// --- Modules ---

function logActivity(text, icon = '🔔') {
    state.activity.unshift({ id: Date.now(), text, icon, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) });
    if(state.activity.length > 10) state.activity.pop();
    save();
}

function renderDashboard(c) {
    const totalRev = state.billing.reduce((a, b) => a + (parseFloat(b.total) || 0), 0);
    const pendingRev = state.billing.filter(b => b.status === 'Unpaid').reduce((a, b) => a + (parseFloat(b.total) || 0), 0);

    c.innerHTML = `<h1>Dashboard</h1>
    <div class="stats-grid">
        <div class="nm-card"><p class="stat-label">Total Patients</p><p class="stat-value">${state.patients.length}</p></div>
        <div class="nm-card"><p class="stat-label">Total Revenue</p><p class="stat-value">${state.settings.currency}${totalRev.toFixed(2)}</p></div>
        <div class="nm-card"><p class="stat-label">Pending</p><p class="stat-value" style="color:var(--danger-color)">${state.settings.currency}${pendingRev.toFixed(2)}</p></div>
        <div class="nm-card"><p class="stat-label">Appointments</p><p class="stat-value">${state.appointments.length}</p></div>
    </div>
    
    <div style="display:grid; grid-template-columns: 2fr 1fr; gap:30px; margin-top:30px;">
        <div class="nm-card">
            <h3>Recent Activity</h3>
            <div style="margin-top:20px;">
                ${state.activity.length ? state.activity.map(a => `
                    <div class="activity-item">
                        <div class="activity-icon">${a.icon}</div>
                        <div style="flex:1">
                            <p style="font-weight:600; font-size:0.9rem;">${a.text}</p>
                            <p style="color:var(--text-light); font-size:0.8rem;">${a.time}</p>
                        </div>
                    </div>
                `).join('') : '<p style="color:var(--text-light); text-align:center; padding:20px;">No recent activity</p>'}
            </div>
        </div>
        <div class="nm-card">
            <h3>Quick Actions</h3>
            <div style="display:flex; flex-direction:column; gap:10px; margin-top:20px;">
                <button class="nm-button primary" onclick="showPatientForm()">+ Register Patient</button>
                <button class="nm-button" onclick="showApptForm()">+ Schedule Appointment</button>
                <button class="nm-button" onclick="showInvoiceForm()">+ Create Invoice</button>
            </div>
        </div>
    </div>`;
}

function renderPatients(c) {
    c.innerHTML = `<div class="flex-between"><h2>Patients</h2><button class="nm-button primary" onclick="showPatientForm()">+ Register</button></div>
    <div class="stats-grid" style="margin-top:20px;">${state.patients.map(p => `<div class="nm-card" onclick="viewDossier('${p.id}')" style="cursor:pointer;"><h4>${p.name}</h4><p>${p.bsn}</p></div>`).join('')}</div>`;
}

window.showPatientForm = (id = null) => {
    const p = id ? state.patients.find(x => x.id === id) : {};
    showModal(`<h3>Patient Profile</h3>
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:15px;">
        <input type="text" id="p-name" class="nm-input" placeholder="Full Name" value="${p.name||''}">
        <input type="text" id="p-bsn" class="nm-input" placeholder="BSN" value="${p.bsn||''}">
        <input type="date" id="p-dob" class="nm-input" value="${p.dob||''}">
        <select id="p-gender" class="nm-select"><option>Male</option><option>Female</option></select>
        <input type="text" id="p-addr" class="nm-input" placeholder="Address" value="${p.address||''}" style="grid-column: span 2;">
        <input type="text" id="p-phone" class="nm-input" placeholder="Phone" value="${p.phone||''}">
        <input type="text" id="p-email" class="nm-input" placeholder="Email" value="${p.email||''}">
        <textarea id="p-rem" class="nm-textarea" placeholder="Remarks" style="grid-column: span 2;">${p.remark||''}</textarea>
    </div>
    <div style="margin-top:20px; display:flex; gap:10px;">
        <button class="nm-button primary" onclick="savePatient('${id}')">Save</button>
        ${id ? `<button class="nm-button danger" onclick="deletePatient('${id}')">Delete</button>` : ''}
    </div>`);
};

window.savePatient = (id) => {
    const d = { id: id!=='null'&&id?id:'P-'+Date.now(), name:document.getElementById('p-name').value, bsn:document.getElementById('p-bsn').value, dob:document.getElementById('p-dob').value, gender:document.getElementById('p-gender').value, address:document.getElementById('p-addr').value, phone:document.getElementById('p-phone').value, email:document.getElementById('p-email').value, remark:document.getElementById('p-rem').value, consults: id!=='null'&&id?state.patients.find(x=>x.id===id).consults:[], investigations: id!=='null'&&id?state.patients.find(x=>x.id===id).investigations:[] };
    if(id!=='null'&&id) state.patients[state.patients.findIndex(x=>x.id===id)] = d; else state.patients.push(d);
    save(); hideModal(); render('patients');
};
window.deletePatient = (id) => { if(confirm('Delete?')) { state.patients = state.patients.filter(x=>x.id!==id); save(); hideModal(); render('patients'); } };

window.viewDossier = (id, tab = 'consults') => {
    const p = state.patients.find(x => x.id === id);
    showModal(`<h2>${p.name}</h2>
    <div style="display:flex; gap:10px; margin:15px 0;">
        <button class="nm-button ${tab==='consults'?'active':''}" onclick="viewDossier('${id}', 'consults')">Consults</button>
        <button class="nm-button ${tab==='tests'?'active':''}" onclick="viewDossier('${id}', 'tests')">Tests</button>
        <button class="nm-button" onclick="showPatientForm('${id}')">Info</button>
    </div>
    <div id="dossier-inner">
        ${tab==='consults' ? `<button class="nm-button primary" onclick="showConsultForm('${id}')">+ Add</button>${p.consults.map(c => `<div class="nm-inset" style="padding:10px; margin-top:10px;">${c.date}: ${c.diagnosis} <button class="nm-button danger" onclick="deleteSub('${id}','${c.id}','consults')">X</button></div>`).join('')}` : ''}
        ${tab==='tests' ? `<button class="nm-button primary" onclick="showTestForm('${id}')">+ Add</button>${p.investigations.map(t => `<div class="nm-inset" style="padding:10px; margin-top:10px;">${t.date}: ${t.name} <button class="nm-button danger" onclick="deleteSub('${id}','${t.id}','investigations')">X</button></div>`).join('')}` : ''}
    </div>`);
};
window.showConsultForm = (pId) => showModal(`<h3>Consult</h3><input type="date" id="c-date" class="nm-input"><input type="text" id="c-diag" class="nm-input" placeholder="Diag"><button class="nm-button primary" onclick="saveSub('${pId}','consults')">Save</button>`);
window.showTestForm = (pId) => showModal(`<h3>Test</h3><input type="date" id="t-date" class="nm-input"><input type="text" id="t-name" class="nm-input" placeholder="Name"><button class="nm-button primary" onclick="saveSub('${pId}','investigations')">Save</button>`);
window.saveSub = (pId, type) => {
    const p = state.patients.find(x=>x.id===pId);
    const d = type==='consults'?{id:Date.now(),date:document.getElementById('c-date').value,diagnosis:document.getElementById('c-diag').value}:{id:Date.now(),date:document.getElementById('t-date').value,name:document.getElementById('t-name').value};
    p[type].unshift(d); save(); viewDossier(pId, type);
};
window.deleteSub = (pId, rId, type) => { if(confirm('Delete?')) { const p = state.patients.find(x=>x.id===pId); p[type] = p[type].filter(x=>x.id!=rId); save(); viewDossier(pId, type); } };

function renderStaff(c) {
    c.innerHTML = `<div class="flex-between"><h2>Medical Staff</h2><button class="nm-button primary" onclick="showStaffForm()">+ Add Doctor</button></div>
    <div class="stats-grid" style="margin-top:20px;">${state.doctors.map(d => `<div class="nm-card" onclick="showStaffForm('${d.id}')" style="cursor:pointer;"><h4>${d.name}</h4><p>${d.specialty}</p></div>`).join('')}</div>`;
}
window.showStaffForm = (id = null) => {
    const d = id ? state.doctors.find(x => x.id === id) : {};
    showModal(`<h3>Doctor</h3><input type="text" id="s-name" class="nm-input" placeholder="Name" value="${d.name||''}"><input type="text" id="s-spec" class="nm-input" placeholder="Spec" value="${d.specialty||''}"><div style="margin-top:20px; display:flex; gap:10px;"><button class="nm-button primary" onclick="saveStaff('${id}')">Save</button>${id ? `<button class="nm-button danger" onclick="deleteStaff('${id}')">Delete</button>` : ''}</div>`);
};
window.saveStaff = (id) => {
    const d = { id: id!=='null'&&id?id:'D-'+Date.now(), name: document.getElementById('s-name').value, specialty: document.getElementById('s-spec').value };
    if(id!=='null'&&id) state.doctors[state.doctors.findIndex(x=>x.id===id)] = d; else state.doctors.push(d);
    save(); hideModal(); render('staff');
};
window.deleteStaff = (id) => { if(confirm('Delete?')) { state.doctors = state.doctors.filter(x=>x.id!==id); save(); hideModal(); render('staff'); } };

function renderPharmacy(c) {
    c.innerHTML = `<div class="flex-between"><h2>Pharmacy</h2><button class="nm-button primary" onclick="showInvForm()">+ Add Item</button></div>
    <div class="stats-grid" style="margin-top:20px;">${state.inventory.map(i => `<div class="nm-card" onclick="showInvForm('${i.id}')" style="cursor:pointer;"><h4>${i.name}</h4><p>${i.stock} ${i.unit||'Units'}</p></div>`).join('')}</div>`;
}
window.showInvForm = (id = null) => {
    const i = id ? state.inventory.find(x => x.id === id) : {};
    showModal(`<h3>Inventory</h3><input type="text" id="i-name" class="nm-input" placeholder="Item Name" value="${i.name||''}"><input type="number" id="i-stock" class="nm-input" placeholder="Stock" value="${i.stock||0}"><input type="text" id="i-unit" class="nm-input" placeholder="Unit (e.g. Boxes)" value="${i.unit||'Units'}"><div style="margin-top:20px; display:flex; gap:10px;"><button class="nm-button primary" onclick="saveInv('${id}')">Save</button>${id ? `<button class="nm-button danger" onclick="deleteInv('${id}')">Delete</button>` : ''}</div>`);
};
window.saveInv = (id) => {
    const i = { id: id!=='null'&&id?id:'I-'+Date.now(), name: document.getElementById('i-name').value, stock: parseInt(document.getElementById('i-stock').value)||0, unit: document.getElementById('i-unit').value };
    if(id!=='null'&&id) state.inventory[state.inventory.findIndex(x=>x.id===id)] = i; else state.inventory.push(i);
    save(); hideModal(); render('pharmacy');
};
window.deleteInv = (id) => { if(confirm('Delete?')) { state.inventory = state.inventory.filter(x=>x.id!==id); save(); hideModal(); render('pharmacy'); } };

function renderDepartments(c) {
    c.innerHTML = `<div class="flex-between"><h2>Departments</h2><button class="nm-button primary" onclick="showDeptForm()">+ Add Dept</button></div>
    <div class="stats-grid" style="margin-top:20px;">${state.departments.map(d => `<div class="nm-card" onclick="showDeptForm('${d.id}')" style="cursor:pointer;"><h4>${d.name}</h4><p>Head: ${d.head}</p></div>`).join('')}</div>`;
}
window.showDeptForm = (id = null) => {
    const d = id ? state.departments.find(x => x.id === id) : {};
    showModal(`<h3>Department</h3><input type="text" id="d-name" class="nm-input" placeholder="Name" value="${d.name||''}"><input type="text" id="d-head" class="nm-input" placeholder="Head" value="${d.head||''}"><div style="margin-top:20px; display:flex; gap:10px;"><button class="nm-button primary" onclick="saveDept('${id}')">Save</button>${id ? `<button class="nm-button danger" onclick="deleteDept('${id}')">Delete</button>` : ''}</div>`);
};
window.saveDept = (id) => {
    const d = { id: id!=='null'&&id?id:'DE-'+Date.now(), name: document.getElementById('d-name').value, head: document.getElementById('d-head').value };
    if(id!=='null'&&id) state.departments[state.departments.findIndex(x=>x.id===id)] = d; else state.departments.push(d);
    save(); hideModal(); render('departments');
};
window.deleteDept = (id) => { if(confirm('Delete?')) { state.departments = state.departments.filter(x=>x.id!==id); save(); hideModal(); render('departments'); } };

function renderAppointments(c) {
    c.innerHTML = `<div class="flex-between"><h2>Appointments</h2><button class="nm-button primary" onclick="showApptForm()">+ New Appt</button></div>
    <div class="stats-grid" style="margin-top:20px;">${state.appointments.map(a => `<div class="nm-card" onclick="showApptForm('${a.id}')" style="cursor:pointer;"><h4>${a.datetime.replace('T',' ')}</h4><p>${a.pName} (${a.duration}m)</p></div>`).join('')}</div>`;
}
window.showApptForm = (id = null) => {
    const a = id ? state.appointments.find(x => x.id === id) : { duration: 15 };
    showModal(`<h3>Appointment</h3><div style="display:flex; flex-direction:column; gap:10px; margin-top:10px;"><input type="datetime-local" id="a-date" class="nm-input" value="${a.datetime||''}"><input type="number" id="a-dur" class="nm-input" value="${a.duration}">${createSearchSelect('Patient','a-p',state.patients,a.pId)}${createSearchSelect('Doctor','a-d',state.doctors,a.dId)}${createSearchSelect('Dept','a-dept',state.departments,a.deptId)}<input type="text" id="a-reason" class="nm-input" placeholder="Reason" value="${a.reason||''}"></div><div style="margin-top:20px; display:flex; gap:10px;"><button class="nm-button primary" onclick="saveAppt('${id}')">Save</button>${id ? `<button class="nm-button danger" onclick="deleteAppt('${id}')">Delete</button>` : ''}</div>`);
};
window.saveAppt = (id) => {
    const pId = document.getElementById('a-p-val').value;
    const dId = document.getElementById('a-d-val').value;
    const deptId = document.getElementById('a-dept-val').value;
    const p = state.patients.find(x=>x.id===pId);
    const d = state.doctors.find(x=>x.id===dId);
    const dept = state.departments.find(x=>x.id===deptId);
    if(!p || !d || !dept) { alert('Selection required'); return; }
    const data = { id: id!=='null'&&id?id:'A-'+Date.now(), datetime:document.getElementById('a-date').value, duration:document.getElementById('a-dur').value, pId, pName:p.name, dId, dName:d.name, deptId, deptName:dept.name, reason:document.getElementById('a-reason').value };
    if(id!=='null'&&id) state.appointments[state.appointments.findIndex(x=>x.id===id)] = data; else state.appointments.push(data);
    save(); hideModal(); render('appointments');
};
window.deleteAppt = (id) => { if(confirm('Delete?')) { state.appointments = state.appointments.filter(x=>x.id!==id); save(); hideModal(); render('appointments'); } };

function renderSettings(c) { 
    c.innerHTML = `<h2>Settings</h2>
    <div class="nm-card" style="max-width:500px; margin-top:20px;">
        <h3>Hospital Profile</h3>
        <div style="display:flex; flex-direction:column; gap:15px; margin-top:15px;">
            <div class="form-group">
                <label>Hospital Name</label>
                <input type="text" id="set-name" class="nm-input" value="${state.settings.hospitalName}">
            </div>
            <div class="form-group">
                <label>Currency Symbol</label>
                <input type="text" id="set-cur" class="nm-input" value="${state.settings.currency}">
            </div>
            <button class="nm-button primary" onclick="saveSettings()">Save Settings</button>
        </div>
        <hr style="margin:30px 0;">
        <h3>System Maintenance</h3>
        <button class="nm-button danger" style="margin-top:15px;" onclick="if(confirm('Clear all data?')) { localStorage.clear(); location.reload(); }">Hard Reset System</button>
        <button class="nm-button" style="margin-top:10px;" onclick="seedData()">Seed Demo Data</button>
    </div>`; 
}

window.saveSettings = () => {
    state.settings.hospitalName = document.getElementById('set-name').value;
    state.settings.currency = document.getElementById('set-cur').value;
    save();
    alert('Settings saved');
    render('settings');
};

function renderBilling(c) {
    c.innerHTML = `<div class="flex-between"><h2>Billing & Invoices</h2><button class="nm-button primary" onclick="showInvoiceForm()">+ Create Invoice</button></div>
    <div style="margin-top:20px;">
        <table class="nm-table">
            <thead><tr style="text-align:left; color:var(--text-light);"><th>ID</th><th>Patient</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>
                ${state.billing.map(b => `
                    <tr onclick="viewInvoice('${b.id}')" style="cursor:pointer;">
                        <td>${b.id}</td>
                        <td>${b.pName}</td>
                        <td style="font-weight:700;">${state.settings.currency}${parseFloat(b.total).toFixed(2)}</td>
                        <td><span class="badge ${b.status==='Paid'?'success':'danger'}">${b.status}</span></td>
                        <td>${b.date}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>`;
}

window.showInvoiceForm = (id = null) => {
    const b = id ? state.billing.find(x => x.id === id) : { items: [] };
    showModal(`<h3>${id?'Edit':'Create'} Invoice</h3>
    <div style="display:flex; flex-direction:column; gap:10px; margin-top:10px;">
        ${createSearchSelect('Patient','b-p',state.patients,b.pId)}
        <div class="nm-inset" style="padding:15px;">
            <h4>Items</h4>
            <div id="inv-items" style="margin:10px 0;">
                ${b.items.map((it, idx) => `
                    <div style="display:flex; gap:10px; margin-bottom:5px;">
                        <input type="text" class="nm-input item-desc" placeholder="Description" value="${it.desc}" style="flex:2">
                        <input type="number" class="nm-input item-amt" placeholder="Amount" value="${it.amt}" style="flex:1">
                        <button class="nm-button danger" style="padding:5px 10px;" onclick="this.parentElement.remove()">X</button>
                    </div>
                `).join('')}
            </div>
            <button class="nm-button" onclick="addInvItem()">+ Add Item</button>
        </div>
        <select id="b-status" class="nm-select"><option ${b.status==='Unpaid'?'selected':''}>Unpaid</option><option ${b.status==='Paid'?'selected':''}>Paid</option></select>
    </div>
    <div style="margin-top:20px; display:flex; gap:10px;">
        <button class="nm-button primary" onclick="saveInvoice('${id}')">Save Invoice</button>
        ${id ? `<button class="nm-button danger" onclick="deleteInvoice('${id}')">Delete</button>` : ''}
    </div>`);
};

window.addInvItem = () => {
    const d = document.createElement('div');
    d.style.display = 'flex'; d.style.gap = '10px'; d.style.marginBottom = '5px';
    d.innerHTML = `<input type="text" class="nm-input item-desc" placeholder="Description" style="flex:2"><input type="number" class="nm-input item-amt" placeholder="Amount" style="flex:1"><button class="nm-button danger" style="padding:5px 10px;" onclick="this.parentElement.remove()">X</button>`;
    document.getElementById('inv-items').appendChild(d);
};

window.saveInvoice = (id) => {
    const pId = document.getElementById('b-p-val').value;
    const p = state.patients.find(x=>x.id===pId);
    if(!p) { alert('Patient required'); return; }
    
    const items = Array.from(document.querySelectorAll('#inv-items > div')).map(row => ({
        desc: row.querySelector('.item-desc').value,
        amt: parseFloat(row.querySelector('.item-amt').value) || 0
    }));
    
    const total = items.reduce((s, i) => s + i.amt, 0);
    const data = { 
        id: id!=='null'&&id?id:'INV-'+Date.now(), 
        date: new Date().toISOString().split('T')[0], 
        pId, pName: p.name, 
        items, total, 
        status: document.getElementById('b-status').value 
    };
    
    if(id!=='null'&&id) state.billing[state.billing.findIndex(x=>x.id===id)] = data;
    else {
        state.billing.unshift(data);
        logActivity(`New invoice created for ${p.name}`, '💰');
    }
    save(); hideModal(); render('billing');
};

window.viewInvoice = (id) => {
    const b = state.billing.find(x => x.id === id);
    showModal(`
        <div class="invoice-preview">
            <div class="invoice-header flex-between">
                <div>
                    <h2>INVOICE</h2>
                    <p style="color:var(--text-light)">#${b.id}</p>
                </div>
                <div style="text-align:right">
                    <h3>${state.settings.hospitalName}</h3>
                    <p>${b.date}</p>
                </div>
            </div>
            <div style="margin:20px 0;">
                <p><strong>To:</strong> ${b.pName}</p>
            </div>
            <table class="invoice-table">
                <thead><tr><th>Description</th><th style="text-align:right">Amount</th></tr></thead>
                <tbody>
                    ${b.items.map(it => `<tr><td>${it.desc}</td><td style="text-align:right">${state.settings.currency}${it.amt.toFixed(2)}</td></tr>`).join('')}
                </tbody>
            </table>
            <div class="invoice-total">
                Total: ${state.settings.currency}${b.total.toFixed(2)}
            </div>
            <div style="margin-top:30px; display:flex; gap:10px;">
                <button class="nm-button primary" onclick="showInvoiceForm('${b.id}')">Edit</button>
                <button class="nm-button" onclick="hideModal()">Close</button>
                <button class="nm-button" style="margin-left:auto;" onclick="window.print()">Print</button>
            </div>
        </div>
    `);
};

window.seedData = () => {
    state.patients = [
        {id:'P1', name:'John Doe', bsn:'123456789', dob:'1985-05-15', gender:'Male', consults:[], investigations:[]},
        {id:'P2', name:'Jane Smith', bsn:'987654321', dob:'1990-08-22', gender:'Female', consults:[], investigations:[]}
    ];
    state.doctors = [
        {id:'D1', name:'Dr. Sarah Wilson', specialty:'Cardiology'},
        {id:'D2', name:'Dr. Mark Miller', specialty:'Pediatrics'}
    ];
    state.departments = [
        {id:'DE1', name:'Emergency', head:'Dr. Wilson'},
        {id:'DE2', name:'Radiology', head:'Dr. Evans'}
    ];
    state.billing = [
        {id:'INV-101', date:'2024-05-10', pId:'P1', pName:'John Doe', total:250, status:'Paid', items:[{desc:'General Consultation', amt:250}]},
        {id:'INV-102', date:'2024-05-12', pId:'P2', pName:'Jane Smith', total:1500, status:'Unpaid', items:[{desc:'MRI Scan', amt:1500}]}
    ];
    state.activity = [
        {id:1, text:'Hospital management system initialized', icon:'🚀', time:'09:00 AM'},
        {id:2, text:'Emergency department duty roster updated', icon:'📋', time:'10:30 AM'}
    ];
    save();
    location.reload();
};

// --- Init ---
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.nav-item').forEach(i => i.onclick = () => render(i.getAttribute('data-view')));
    // Seed data if system is empty
    if(state.patients.length === 0 && state.doctors.length === 0) {
        // Silent seed for first run
        state.patients = [{id:'P1', name:'Welcome Patient', bsn:'000', dob:'2000-01-01', gender:'Male', consults:[], investigations:[]}];
        state.doctors = [{id:'D1', name:'Dr. Admin', specialty:'General'}];
        save();
    }
    render('dashboard');
});
