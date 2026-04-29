// Using global supabase object initialized in supabase.js
const supabase = window.supabase;


document.addEventListener('DOMContentLoaded', async () => {
    
    // Check Auth Status initially
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
        showDashboard();
    } else {
        document.getElementById('login-screen').style.display = 'block';
    }

    // Login Logic
    const loginForm = document.getElementById('admin-login-form');
    if(loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('admin-email').value;
            const password = document.getElementById('admin-password').value;
            
            const btn = loginForm.querySelector('button');
            const err = document.getElementById('login-error');
            btn.innerText = "Зареждане...";
            err.style.display = 'none';

            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password,
            });

            if (error) {
                console.error(error);
                err.style.display = 'block';
                btn.innerText = "Влез";
            } else {
                showDashboard();
            }
        });
    }

    // Logout Logic
    const logoutBtn = document.getElementById('logout-btn');
    if(logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            await supabase.auth.signOut();
            location.reload();
        });
    }

    // Tab Navigation Logic
    const tabLinks = document.querySelectorAll('.admin-nav-links a[data-tab]');
    tabLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            tabLinks.forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.admin-tab').forEach(t => t.style.display = 'none');
            
            link.classList.add('active');
            const tabId = link.getAttribute('data-tab');
            document.getElementById('tab-' + tabId).style.display = 'block';

            // Refresh data when navigating
            if(tabId === 'leads') fetchLeads();
            else if(tabId === 'services') fetchServices();
            else if(tabId === 'portfolio') fetchPortfolio();
        });
    });

    // Helper functions
    function showDashboard() {
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('dashboard-screen').style.display = 'block';
        fetchLeads(); // Fetch initial data
    }

    async function fetchLeads() {
        const { data, error } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
        const tbody = document.getElementById('leads-body');
        if (error) {
            tbody.innerHTML = `<tr><td colspan="4">Грешка при зареждане.</td></tr>`;
            return;
        }
        
        tbody.innerHTML = '';
        if(data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4">Няма намерени запитвания.</td></tr>`;
            return;
        }

        data.forEach(lead => {
            const tr = document.createElement('tr');
            
            let statusClass = 'status-new';
            let statusText = 'Ново';
            if(lead.status === 'contacted') { statusClass = 'status-contacted'; statusText = 'Свързани'; }
            if(lead.status === 'closed') { statusClass = 'status-closed'; statusText = 'Приключено'; }

            tr.innerHTML = `
                <td>
                    <strong>${lead.name}</strong><br>
                    <span style="font-size: 0.85rem; color: #aaa;">${lead.email}</span><br>
                    <span style="font-size: 0.8rem; color: #666;">${new Date(lead.created_at).toLocaleDateString('bg-BG')}</span>
                </td>
                <td>
                    <strong>${lead.service}</strong><br>
                    <span style="font-size: 0.85rem; color: #B3B3B3;">Бюджет: ${lead.budget}</span><br>
                    <p style="margin-top: 5px; font-size: 0.9rem;">${lead.message}</p>
                </td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                <td>
                    <select onchange="window.updateLeadStatus('${lead.id}', this.value)" style="margin-bottom: 5px; width: 100%; padding: 5px; background: #222; color: #EFEFEF; border: 1px solid #333;">
                        <option value="new" ${lead.status === 'new' ? 'selected' : ''}>Ново</option>
                        <option value="contacted" ${lead.status === 'contacted' ? 'selected' : ''}>Свързани</option>
                        <option value="closed" ${lead.status === 'closed' ? 'selected' : ''}>Приключено</option>
                    </select>
                    <br>
                    <button class="action-btn" onclick="window.deleteLead('${lead.id}')" style="margin-top: 8px; color: #ff4757; font-size: 0.85rem;"><i class="fa-solid fa-trash"></i> Изтрий</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    // Lead Actions
    window.updateLeadStatus = async (id, status) => {
        await supabase.from('leads').update({ status }).eq('id', id);
        fetchLeads();
    };

    window.deleteLead = async (id) => {
        if(confirm("Сигурни ли сте, че искате да изтриете това запитване?")) {
            await supabase.from('leads').delete().eq('id', id);
            fetchLeads();
        }
    };

    async function uploadImage(file, folder) {
        if (!file) return null;
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${folder}/${fileName}`;

        const { error } = await supabase.storage.from('media').upload(filePath, file);
        if (error) {
            alert('Грешка при качване на снимка: ' + error.message);
            return null;
        }

        const { data } = supabase.storage.from('media').getPublicUrl(filePath);
        return data.publicUrl;
    }

    async function fetchServices() {
        const { data, error } = await supabase.from('services').select('*').order('created_at', { ascending: false });
        const tbody = document.getElementById('services-body');
        if (error || data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4">Няма намерени услуги.</td></tr>`;
            return;
        }
        
        tbody.innerHTML = '';
        data.forEach(service => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><img src="${service.image_url || 'https://via.placeholder.com/60'}" class="admin-thumbnail"></td>
                <td>
                    <strong>${service.title}</strong><br>
                    <span style="font-size: 0.85rem; color: #aaa;">${service.category}</span>
                </td>
                <td>${service.featured ? '<span class="status-badge status-closed">Да</span>' : '<span class="status-badge status-new">Не</span>'}</td>
                <td>
                    <button class="action-btn" onclick='window.editService(${JSON.stringify(service).replace(/'/g, "&#39;")})'><i class="fa-solid fa-pen"></i> Редактирай</button>
                    <button class="action-btn" onclick="window.deleteService('${service.id}')" style="color: #ff4757;"><i class="fa-solid fa-trash"></i> Изтрий</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    window.openServiceModal = () => {
        document.getElementById('service-form').reset();
        document.getElementById('service-id').value = '';
        document.getElementById('service-modal-title').innerText = 'Добавяне на Услуга';
        document.getElementById('service-modal').classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    window.closeServiceModal = () => {
        document.getElementById('service-modal').classList.remove('active');
        document.body.style.overflow = '';
    };

    window.editService = (service) => {
        document.getElementById('service-id').value = service.id;
        document.getElementById('service-title').value = service.title;
        document.getElementById('service-category').value = service.category;
        document.getElementById('service-description').value = service.description;
        document.getElementById('service-price').value = service.price || '';
        document.getElementById('service-featured').checked = service.featured;
        document.getElementById('service-modal-title').innerText = 'Редактиране на Услуга';
        
        document.getElementById('service-modal').classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    const serviceForm = document.getElementById('service-form');
    if (serviceForm) {
        serviceForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('service-id').value;
            const title = document.getElementById('service-title').value;
            const category = document.getElementById('service-category').value;
            const description = document.getElementById('service-description').value;
            const price = document.getElementById('service-price').value;
            const featured = document.getElementById('service-featured').checked;
            
            const fileInput = document.getElementById('service-image');
            const file = fileInput.files[0];
            
            let image_url = null;
            if (file) {
                const btn = serviceForm.querySelector('button[type="submit"]');
                btn.innerText = "Качване...";
                image_url = await uploadImage(file, 'services');
                btn.innerText = "Запази Услугата";
            }

            const payload = { title, category, description, price, featured };
            if (image_url) payload.image_url = image_url;

            let error;
            if (id) {
                const res = await supabase.from('services').update(payload).eq('id', id);
                error = res.error;
            } else {
                const res = await supabase.from('services').insert([payload]);
                error = res.error;
            }

            if (error) {
                alert('Грешка: ' + error.message);
            } else {
                window.closeServiceModal();
                fetchServices();
            }
        });
    }

    window.deleteService = async (id) => {
        if(confirm("Изтриване на тази услуга?")) {
            await supabase.from('services').delete().eq('id', id);
            fetchServices();
        }
    };

    async function fetchPortfolio() {
        const { data, error } = await supabase.from('portfolio').select('*').order('created_at', { ascending: false });
        const tbody = document.getElementById('portfolio-body');
        if (error || data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="3">Няма намерени елементи.</td></tr>`;
            return;
        }
        
        tbody.innerHTML = '';
        data.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><img src="${item.image_url || 'https://via.placeholder.com/60'}" class="admin-thumbnail"></td>
                <td>
                    <strong>${item.title}</strong><br>
                    <span style="font-size: 0.85rem; color: #aaa;">Клиент: ${item.client_name || '-'}</span>
                </td>
                <td>
                    <button class="action-btn" onclick='window.editPortfolio(${JSON.stringify(item).replace(/'/g, "&#39;")})'><i class="fa-solid fa-pen"></i> Редактирай</button>
                    <button class="action-btn" onclick="window.deletePortfolio('${item.id}')" style="color: #ff4757;"><i class="fa-solid fa-trash"></i> Изтрий</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    window.openPortfolioModal = () => {
        document.getElementById('portfolio-form').reset();
        document.getElementById('portfolio-id').value = '';
        document.getElementById('portfolio-modal-title').innerText = 'Добавяне на Проект';
        document.getElementById('portfolio-modal').classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    window.closePortfolioModal = () => {
        document.getElementById('portfolio-modal').classList.remove('active');
        document.body.style.overflow = '';
    };

    window.editPortfolio = (item) => {
        document.getElementById('portfolio-id').value = item.id;
        document.getElementById('portfolio-title').value = item.title;
        document.getElementById('portfolio-client').value = item.client_name || '';
        document.getElementById('portfolio-description').value = item.description;
        document.getElementById('portfolio-modal-title').innerText = 'Редактиране на Проект';
        
        document.getElementById('portfolio-modal').classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    const portfolioForm = document.getElementById('portfolio-form');
    if (portfolioForm) {
        portfolioForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('portfolio-id').value;
            const title = document.getElementById('portfolio-title').value;
            const client_name = document.getElementById('portfolio-client').value;
            const description = document.getElementById('portfolio-description').value;
            
            const fileInput = document.getElementById('portfolio-image');
            const file = fileInput.files[0];
            
            let image_url = null;
            if (file) {
                const btn = portfolioForm.querySelector('button[type="submit"]');
                btn.innerText = "Качване...";
                image_url = await uploadImage(file, 'portfolio');
                btn.innerText = "Запази Проекта";
            }

            const payload = { title, client_name, description };
            if (image_url) payload.image_url = image_url;

            let error;
            if (id) {
                const res = await supabase.from('portfolio').update(payload).eq('id', id);
                error = res.error;
            } else {
                const res = await supabase.from('portfolio').insert([payload]);
                error = res.error;
            }

            if (error) {
                alert('Грешка: ' + error.message);
            } else {
                window.closePortfolioModal();
                fetchPortfolio();
            }
        });
    }

    window.deletePortfolio = async (id) => {
        if(confirm("Изтриване на този проект?")) {
            await supabase.from('portfolio').delete().eq('id', id);
            fetchPortfolio();
        }
    };
});
