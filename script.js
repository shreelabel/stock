// Paper Stock Management System - Complete Working Version
// Mriganka B Debnath - Final Version

class PaperStockApp {
    constructor() {
        this.currentStock = [];
        this.isAdminLoggedIn = false;
        this.filteredStock = [];
        this.currentSort = { column: null, direction: 'asc' };
          console.log('PaperStockApp initializing...');
        this.init();
    }

    init() {
        console.log('Initializing Paper Stock Management System...');
        this.checkAdminStatus();
        this.setupEventListeners();
        this.loadStock();
    }

    // Admin Authentication
    checkAdminStatus() {
        this.isAdminLoggedIn = sessionStorage.getItem('adminLoggedIn') === 'true';
        console.log('Admin status:', this.isAdminLoggedIn ? 'Logged In' : 'Guest');
        this.updateLoginState();
    }    updateLoginState() {
        const loginBtn = document.querySelector('button[onclick="handleLogin()"]');        const logoutBtn = document.getElementById('logoutBtn');
        const changePasswordBtn = document.getElementById('changePasswordBtn');
        const adminStatus = document.getElementById('adminStatus');
        const addRollTabItem = document.getElementById('add-roll-tab-item');
        const excelTabItem = document.getElementById('excel-tab-item');
        
        if (this.isAdminLoggedIn) {
            if (loginBtn) loginBtn.style.display = 'none';
            if (logoutBtn) logoutBtn.classList.remove('d-none');
            if (changePasswordBtn) changePasswordBtn.classList.remove('d-none');            if (adminStatus) {
                adminStatus.textContent = 'Admin';
                adminStatus.className = 'text-success ms-2';
            }            
            if (addRollTabItem) addRollTabItem.style.display = 'block';
            if (excelTabItem) excelTabItem.style.display = 'block';
        } else {
            if (loginBtn) loginBtn.style.display = 'inline-block';
            if (logoutBtn) logoutBtn.classList.add('d-none');
            if (changePasswordBtn) changePasswordBtn.classList.add('d-none');            if (adminStatus) {
                adminStatus.textContent = 'Guest';
                adminStatus.className = 'text-warning ms-2';
            }
            if (addRollTabItem) addRollTabItem.style.display = 'none';
            if (excelTabItem) excelTabItem.style.display = 'none';
        }
        
        // Refresh display with current data
        this.displayStock(this.filteredStock.length > 0 ? this.filteredStock : this.currentStock);
    }

    // Event Listeners Setup
    setupEventListeners() {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', () => this.applyFilters());
        }
        
        const filters = ['materialFilter', 'statusFilter', 'companyFilter', 'gsmFilter', 'widthFilter', 'lengthFilter'];
        filters.forEach(filterId => {
            const element = document.getElementById(filterId);
            if (element) {
                element.addEventListener('change', () => this.applyFilters());
            }
        });        const textFilters = ['lotNoFilter', 'jobNameFilter'];
        textFilters.forEach(filterId => {
            const element = document.getElementById(filterId);
            if (element) {
                element.addEventListener('input', () => this.applyFilters());
            }
        });        // Setup delete all checkbox event listener
        const confirmDeleteAllCheckbox = document.getElementById('confirmDeleteAll');
        const confirmDeleteAllBtn = document.getElementById('confirmDeleteAllBtn');
        if (confirmDeleteAllCheckbox && confirmDeleteAllBtn) {
            confirmDeleteAllCheckbox.addEventListener('change', function() {
                confirmDeleteAllBtn.disabled = !this.checked;
            });
        }        // Setup Add Roll form submission
        const addRollForm = document.getElementById('addRollForm');
        if (addRollForm) {
            addRollForm.addEventListener('submit', handleAddRoll);
        }        // Setup Add Roll tab auto-increment functionality
        this.setupAddRollTabListener();
    
        // Setup mobile table scrolling enhancements
        this.setupMobileTableScrolling();
    }    // Setup Add Roll Tab Event Listener for Auto-increment
    setupAddRollTabListener() {
        const addRollTab = document.getElementById('add-roll-tab');
        if (addRollTab) {
            // Listen for Bootstrap tab shown event
            addRollTab.addEventListener('shown.bs.tab', async (event) => {
                console.log('Add Roll tab activated, fetching next roll number...');
                await this.autoPopulateRollNumber();
            });
        }
    }

    // Mobile Table Scrolling Enhancement Functions
    setupMobileTableScrolling() {
        console.log('Setting up mobile table scrolling enhancements...');
        
        // Initialize scroll indicators for all responsive tables
        this.initializeMobileScrollIndicators();
        
        // Setup touch scroll handling
        this.setupTouchScrollHandling();
        
        // Setup resize handler for dynamic updates
        this.setupResizeHandler();
        
        // Add scroll position memory
        this.setupScrollPositionMemory();
        
        console.log('Mobile table scrolling setup complete');
    }

    initializeMobileScrollIndicators() {
        const responsiveTables = document.querySelectorAll('.table-responsive');
        
        responsiveTables.forEach((container, index) => {
            // Create unique ID if not present
            if (!container.id) {
                container.id = `table-responsive-${index}`;
            }
            
            // Add scroll indicators
            this.addScrollIndicators(container);
            
            // Setup scroll event listeners
            this.setupScrollEventListeners(container);
            
            // Initial scroll state check
            this.updateScrollIndicators(container);
        });
    }

    addScrollIndicators(container) {
        // Remove existing indicators
        const existingIndicators = container.querySelectorAll('.scroll-indicator');
        existingIndicators.forEach(indicator => indicator.remove());
        
        // Create left scroll indicator
        const leftIndicator = document.createElement('div');
        leftIndicator.className = 'scroll-indicator scroll-indicator-left';
        leftIndicator.innerHTML = '◀';
        leftIndicator.setAttribute('aria-label', 'Scroll left to see more');
        
        // Create right scroll indicator
        const rightIndicator = document.createElement('div');
        rightIndicator.className = 'scroll-indicator scroll-indicator-right';
        rightIndicator.innerHTML = '▶';
        rightIndicator.setAttribute('aria-label', 'Scroll right to see more');
        
        // Add click handlers for indicators
        leftIndicator.addEventListener('click', () => {
            container.scrollBy({ left: -200, behavior: 'smooth' });
        });
        
        rightIndicator.addEventListener('click', () => {
            container.scrollBy({ left: 200, behavior: 'smooth' });
        });
        
        // Append indicators to container
        container.appendChild(leftIndicator);
        container.appendChild(rightIndicator);
    }

    setupScrollEventListeners(container) {
        let scrollTimeout;
        
        container.addEventListener('scroll', () => {
            // Update indicators immediately
            this.updateScrollIndicators(container);
            
            // Clear existing timeout
            clearTimeout(scrollTimeout);
            
            // Set new timeout for scroll end
            scrollTimeout = setTimeout(() => {
                this.onScrollEnd(container);
            }, 150);
        });
        
        // Touch events for better mobile experience
        container.addEventListener('touchstart', () => {
            this.onTouchStart(container);
        });
        
        container.addEventListener('touchend', () => {
            this.onTouchEnd(container);
        });
    }

    updateScrollIndicators(container) {
        const leftIndicator = container.querySelector('.scroll-indicator-left');
        const rightIndicator = container.querySelector('.scroll-indicator-right');
        
        if (!leftIndicator || !rightIndicator) return;
        
        const scrollLeft = container.scrollLeft;
        const scrollWidth = container.scrollWidth;
        const clientWidth = container.clientWidth;
        const maxScrollLeft = scrollWidth - clientWidth;
        
        // Update left indicator
        if (scrollLeft > 10) {
            leftIndicator.classList.add('active');
        } else {
            leftIndicator.classList.remove('active');
        }
        
        // Update right indicator
        if (scrollLeft < maxScrollLeft - 10) {
            rightIndicator.classList.add('active');
        } else {
            rightIndicator.classList.remove('active');
        }
        
        // Handle case where table fits entirely
        if (maxScrollLeft <= 0) {
            leftIndicator.style.display = 'none';
            rightIndicator.style.display = 'none';
        } else {
            leftIndicator.style.display = 'block';
            rightIndicator.style.display = 'block';
        }
    }

    setupTouchScrollHandling() {
        const responsiveTables = document.querySelectorAll('.table-responsive');
        
        responsiveTables.forEach(container => {
            let isScrolling = false;
            let startX = 0;
            let scrollStartLeft = 0;
            
            container.addEventListener('touchstart', (e) => {
                isScrolling = true;
                startX = e.touches[0].clientX;
                scrollStartLeft = container.scrollLeft;
            }, { passive: true });
            
            container.addEventListener('touchmove', (e) => {
                if (!isScrolling) return;
                
                const currentX = e.touches[0].clientX;
                const deltaX = currentX - startX;
                
                // Scroll the container
                container.scrollLeft = scrollStartLeft - deltaX;
            }, { passive: true });
            
            container.addEventListener('touchend', () => {
                isScrolling = false;
            }, { passive: true });
        });
    }

    setupResizeHandler() {
        let resizeTimeout;
        
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                console.log('Window resized, updating mobile table indicators...');
                this.initializeMobileScrollIndicators();
            }, 250);
        });
    }

    setupScrollPositionMemory() {
        const responsiveTables = document.querySelectorAll('.table-responsive');
        
        responsiveTables.forEach(container => {
            // Restore scroll position if stored
            const scrollKey = `tableScroll_${container.id}`;
            const savedPosition = sessionStorage.getItem(scrollKey);
            
            if (savedPosition) {
                container.scrollLeft = parseInt(savedPosition, 10);
            }
            
            // Save scroll position on scroll
            container.addEventListener('scroll', () => {
                sessionStorage.setItem(scrollKey, container.scrollLeft.toString());
            });
        });
    }

    onScrollStart(container) {
        container.classList.add('scrolling');
    }

    onScrollEnd(container) {
        container.classList.remove('scrolling');
        
        // Update indicators one final time
        this.updateScrollIndicators(container);
    }

    onTouchStart(container) {
        container.classList.add('touch-scrolling');
    }

    onTouchEnd(container) {
        setTimeout(() => {
            container.classList.remove('touch-scrolling');
        }, 100);
    }

    // Utility function to check if device is mobile
    isMobileDevice() {
        return window.innerWidth <= 768 || 
               /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    // Utility function to refresh mobile indicators (can be called externally)
    refreshMobileTableIndicators() {
        if (this.isMobileDevice()) {
            console.log('Refreshing mobile table indicators...');
            this.initializeMobileScrollIndicators();
        }
    }

    // Fetch Next Roll Number from API and populate the field
    async autoPopulateRollNumber() {
        const rollNumberInput = document.getElementById('rollNumber');
        if (!rollNumberInput) {
            console.warn('Roll number input field not found');
            return;
        }

        // Only auto-populate if the field is empty
        if (rollNumberInput.value.trim() !== '') {
            console.log('Roll number field already has a value, skipping auto-populate');
            return;
        }

        try {
            const response = await fetch('api/get_next_roll_number.php');
            const result = await response.json();

            if (result.success) {
                if (result.nextRollNumber) {
                    rollNumberInput.value = result.nextRollNumber;
                    console.log(`Auto-populated roll number: ${result.nextRollNumber}`);
                    
                    // Show success message if there's a helpful message
                    if (result.message) {
                        this.showMessage(result.message, 'info', 3000);
                    }
                } else {
                    console.log('No roll number suggestion available');
                    if (result.message) {
                        this.showMessage(result.message, 'warning', 5000);
                    }
                }
            } else {
                console.error('Failed to get next roll number:', result.message);
                this.showMessage('Could not auto-generate roll number. Please enter manually.', 'warning');
            }
        } catch (error) {
            console.error('Error fetching next roll number:', error);
            this.showMessage('Could not auto-generate roll number. Please enter manually.', 'warning');
        }
    }

    // Load Stock Data
    async loadStock() {
        try {
            console.log('Loading stock data from API...');
            
            // Set a timeout for the API call
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
            
            const response = await fetch('api/get_rolls.php', {
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            console.log('API Response:', result);            if (result.success && result.rolls && result.rolls.length > 0) {
                // Process the data to fix lotno values
                this.currentStock = result.rolls.map(roll => {
                    // Fix lotno values that are 0, empty string, or null
                    // Only apply N/A if the value is truly missing, not if user entered a value
                    if (roll.lotno === '0' || roll.lotno === 0 || roll.lotno === null || roll.lotno === '') {
                        roll.lotno = 'N/A';
                    }
                    return roll;
                });
                
                console.log(`Successfully loaded ${this.currentStock.length} rolls`);
                this.populateDropdowns();
                this.applyFilters();
                this.showMessage(`Loaded ${this.currentStock.length} rolls successfully`, 'success');
            } else {
                console.log('No data found in database, loading sample data...');
                this.loadSampleData();
            }
        } catch (error) {
            console.error('Error loading from database:', error.message);
            console.log('Loading sample data for demonstration...');
            this.loadSampleData();
        }
    }

    // Load Sample Data (fallback when database unavailable)
    loadSampleData() {
        console.log('Loading sample data for demonstration...');
        this.currentStock = [
            {
                id: 1,
                rollnumber: 'SAMPLE001',
                material: 'Chromo',
                papercompany: 'Camline',
                gsm: '150',
                width: '700',
                length: '1000',
                weight: '105.00',
                lotno: 'LOT001',
                squaremeter: '700.00',
                rolltype: 'Main Roll',
                status: 'Stock',
                originalroll: '',
                jobname: '',
                jobno: '',
                jobsize: '',
                date_added: '2025-06-04 17:30:00'
            },
            {
                id: 2,
                rollnumber: 'SAMPLE002',
                material: 'PP White',
                papercompany: 'Nitin',
                gsm: '80',
                width: '840',
                length: '1200',
                weight: '80.64',
                lotno: 'LOT002',
                squaremeter: '1008.00',
                rolltype: 'Main Roll',
                status: 'Stock',
                originalroll: '',
                jobname: '',
                jobno: '',
                jobsize: '',
                date_added: '2025-06-04 16:45:00'
            },
            {
                id: 3,
                rollnumber: 'SAMPLE003',
                material: 'Clear To Clear',
                papercompany: 'STP',
                gsm: '120',
                width: '600',
                length: '800',
                weight: '57.60',
                lotno: 'LOT003',
                squaremeter: '480.00',
                rolltype: 'Main Roll',
                status: 'Printing',
                originalroll: '',
                jobname: 'Label Job 001',
                jobno: 'JOB001',
                jobsize: '100x50mm',
                date_added: '2025-06-04 15:20:00'
            }        ];
        
        this.populateDropdowns();
        this.displayStock(this.currentStock);
        this.showMessage('Demo mode: Displaying sample data (Database connection unavailable)', 'warning');
    }

    // Populate Dropdown Filters
    populateDropdowns() {
        if (!this.currentStock || this.currentStock.length === 0) return;

        try {
            // Get unique values
            const materials = [...new Set(this.currentStock.map(roll => roll.material).filter(Boolean))];
            const companies = [...new Set(this.currentStock.map(roll => roll.papercompany).filter(Boolean))];
            const gsms = [...new Set(this.currentStock.map(roll => roll.gsm).filter(Boolean))];
            const widths = [...new Set(this.currentStock.map(roll => roll.width).filter(Boolean))];
            const lengths = [...new Set(this.currentStock.map(roll => roll.length).filter(Boolean))];
            
            // Populate dropdowns
            this.populateDropdown('materialFilter', materials);
            this.populateDropdown('companyFilter', companies);
            this.populateDropdown('gsmFilter', gsms);
            this.populateDropdown('widthFilter', widths);
            this.populateDropdown('lengthFilter', lengths);
              // Multi-slit dropdowns
            this.populateDropdown('slitMaterialFilter', materials);
            this.populateDropdown('slitCompanyFilter', companies);
            
            // Populate multi-slit roll dropdown
            this.populateMultiSlitDropdown();
            
            console.log('Dropdowns populated successfully');
        } catch (error) {
            console.error('Error populating dropdowns:', error);
        }
    }

    populateDropdown(id, values) {
        const dropdown = document.getElementById(id);
        if (!dropdown) return;
        
        // Keep first option
        const firstOption = dropdown.options[0];
        dropdown.innerHTML = '';
        if (firstOption) dropdown.appendChild(firstOption);
          // Add sorted values
        values.sort().forEach(value => {
            const option = document.createElement('option');
            option.value = value;
            option.textContent = value;
            dropdown.appendChild(option);
        });
    }

    populateMultiSlitDropdown() {
        const select = document.getElementById('multiSlitRollSelect');
        if (!select) return;
        
        select.innerHTML = '<option value="">Select a roll</option>';

        const stockRolls = this.currentStock.filter(roll => roll.status === 'Stock');
        stockRolls.forEach(roll => {
            const option = document.createElement('option');
            option.value = roll.rollnumber;
            option.textContent = `${roll.rollnumber} - ${roll.material} - ${roll.papercompany} (${roll.width}mm x ${roll.length}m)`;
            select.appendChild(option);
        });
    }

    // Display Stock in Table
    displayStock(stock) {
        const tbody = document.getElementById('stockTableBody');
        if (!tbody) {
            console.error('Stock table body element not found!');
            return;
        }

        tbody.innerHTML = '';

        if (!stock || stock.length === 0) {
            tbody.innerHTML = '<tr><td colspan="16" class="text-center text-muted">No rolls found matching your criteria</td></tr>';
            return;
        }

        // Sort stock to ensure roll 123456 always appears first
        const sortedStock = this.sortStockForDisplay(stock);

        sortedStock.forEach((roll, index) => {
            const row = this.createStockRow(roll, index + 1);
            tbody.appendChild(row);
        });

        console.log(`Displayed ${sortedStock.length} rolls in table`);
    }    // Sort stock for default ascending order by roll number
    sortStockForDisplay(stock) {
        if (!stock || stock.length === 0) return stock;
        
        return stock.sort((a, b) => {
            // Sort by roll number in ascending order
            const rollA = a.rollnumber || '';
            const rollB = b.rollnumber || '';
            return rollA.localeCompare(rollB, undefined, { numeric: true });
        });
    }
    
    // Create Stock Table Row
    createStockRow(roll, serialNo) {
        const row = document.createElement('tr');
        
        // Apply status-based CSS class for row background color
        const statusRowClass = this.getStatusRowClass(roll.status);
        row.className = statusRowClass;
        
        // Calculate square meter
        const squareMeter = this.calculateSquareMeter(roll.width, roll.length);
        const dateAdded = roll.date_added ? new Date(roll.date_added).toLocaleDateString('en-GB') : '';
        const displayStatus = this.getDisplayStatus(roll.status);
          // Check if this is the protected sample roll
        const isProtectedRoll = roll.rollnumber === '123456';
        
        // Check if this is a main/original roll (no suffix like -A, -B)
        const isMainRoll = roll.rolltype === 'Main Roll' || (!roll.rollnumber.includes('-'));
          // Determine roll number display with Main label for original rolls
        let rollNumberDisplay = `<strong>${this.escapeHtml(roll.rollnumber || '')}</strong>`;
        if (isMainRoll && displayStatus.toLowerCase() !== 'used') {
            rollNumberDisplay += ' <span class="main-label">Main</span>';
        }
        if (isProtectedRoll) {
            rollNumberDisplay += ' <small style="color: #333;">(Protected)</small>';
        }
        
        // Status display without Main label
        let statusDisplay = `<span class="badge ${this.getStatusBadgeClass(roll.status)}">${displayStatus}</span>`;

        row.innerHTML = `
            <td>${serialNo}</td>
            <td>${rollNumberDisplay}</td>
            <td>${statusDisplay}</td>
            <td>${this.escapeHtml(roll.material || '')}</td>
            <td>${this.escapeHtml(roll.papercompany || '')}</td>
            <td>${this.escapeHtml(roll.gsm || '')}</td>
            <td>${this.escapeHtml(roll.width || '')}</td>
            <td>${this.escapeHtml(roll.length || '')}</td>            <td>${squareMeter.toFixed(2)}</td>
            <td>${this.escapeHtml(roll.weight || '')}</td>
            <td>${this.escapeHtml((roll.lotno && roll.lotno !== '0' && roll.lotno !== 0 && roll.lotno.toString().trim() !== '') ? roll.lotno : 'N/A')}</td>
            <td>${this.escapeHtml(roll.jobname || '')}</td>
            <td>${this.escapeHtml(roll.jobno || '')}</td>
            <td>${this.escapeHtml(roll.jobsize || '')}</td>
            <td>${dateAdded}</td>
            <td>
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-info btn-sm" onclick="app.printRoll('${roll.id}')" title="Print">
                        <i class="fas fa-print"></i>
                    </button>
                    ${!isProtectedRoll ? `
                        <button class="btn btn-warning btn-sm" onclick="app.editRoll('${roll.id}')" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                    ` : ''}                    ${this.getDisplayStatus(roll.status).toLowerCase() === 'stock' ? `
                        <button class="btn btn-success btn-sm" onclick="app.slitRoll('${roll.id}')" title="Slit">
                            <i class="fas fa-cut"></i>
                        </button>
                    ` : ''}${this.isAdminLoggedIn && !isProtectedRoll ? `
                        <button class="btn btn-danger btn-sm" onclick="openDeleteModal('${roll.rollnumber}')" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    ` : ''}
                </div>
            </td>
        `;

        // Apply status-based row class
        row.classList.add(this.getStatusRowClass(roll.status));

        return row;
    }

    // Helper Functions
    escapeHtml(unsafe) {
        if (!unsafe) return '';
        return unsafe
            .toString()
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    getDisplayStatus(status) {
        if (!status || status === '0' || status === '') {
            return 'Stock';
        }
        return status.toString().toUpperCase();
    }    getStatusBadgeClass(status) {
        const displayStatus = this.getDisplayStatus(status).toLowerCase();
        switch (displayStatus) {
            case 'stock': return 'bg-success';
            case 'printing': return 'bg-warning text-dark';
            case 'used': return 'bg-danger';
            case 'original': return 'bg-primary';
            default: return 'bg-success';
        }
    }

    // Get CSS class for status-based row background colors
    getStatusRowClass(status) {
        const displayStatus = this.getDisplayStatus(status).toLowerCase();
        switch (displayStatus) {
            case 'stock': return 'status-stock';
            case 'printing': return 'status-printing';
            case 'used': return 'status-used';
            case 'original': return 'status-original';
            default: return 'status-stock';
        }
    }

    calculateSquareMeter(width, length) {
        const w = parseFloat(width) || 0;
        const l = parseFloat(length) || 0;
        return (w * l) / 1000; // Convert to square meters
    }

    // Apply Filters
    applyFilters() {
        const searchTerm = (document.getElementById('searchInput')?.value || '').toLowerCase().trim();
        const materialFilter = document.getElementById('materialFilter')?.value || '';
        const statusFilter = document.getElementById('statusFilter')?.value || '';
        const companyFilter = document.getElementById('companyFilter')?.value || '';
        const gsmFilter = document.getElementById('gsmFilter')?.value || '';
        const widthFilter = document.getElementById('widthFilter')?.value || '';
        const lengthFilter = document.getElementById('lengthFilter')?.value || '';
        const lotNoFilter = (document.getElementById('lotNoFilter')?.value || '').toLowerCase().trim();
        const jobNameFilter = (document.getElementById('jobNameFilter')?.value || '').toLowerCase().trim();

        this.filteredStock = this.currentStock.filter(roll => {
            // Text search
            const matchesSearch = !searchTerm || 
                (roll.rollnumber && roll.rollnumber.toLowerCase().includes(searchTerm)) ||
                (roll.material && roll.material.toLowerCase().includes(searchTerm)) ||
                (roll.papercompany && roll.papercompany.toLowerCase().includes(searchTerm)) ||
                (roll.lotno && roll.lotno.toLowerCase().includes(searchTerm)) ||
                (roll.jobname && roll.jobname.toLowerCase().includes(searchTerm));            // Dropdown filters
            const matchesMaterial = !materialFilter || roll.material === materialFilter;
            const matchesStatus = !statusFilter || roll.status === statusFilter;
            const matchesCompany = !companyFilter || roll.papercompany === companyFilter;
            const matchesGsm = !gsmFilter || roll.gsm === gsmFilter;
            const matchesWidth = !widthFilter || roll.width === widthFilter;
            const matchesLength = !lengthFilter || roll.length === lengthFilter;
            
            // Text filters
            const matchesLotNo = !lotNoFilter || (roll.lotno && roll.lotno.toLowerCase().includes(lotNoFilter));
            const matchesJobName = !jobNameFilter || (roll.jobname && roll.jobname.toLowerCase().includes(jobNameFilter));

            return matchesSearch && matchesMaterial && matchesStatus && matchesCompany && 
                   matchesGsm && matchesWidth && matchesLength && matchesLotNo && matchesJobName;
        });

        this.displayStock(this.filteredStock);
        console.log(`Filtered: ${this.filteredStock.length} of ${this.currentStock.length} rolls`);
    }

    // Clear All Filters
    clearAllFilters() {
        // Clear all filter inputs
        const searchInput = document.getElementById('searchInput');
        const materialFilter = document.getElementById('materialFilter');
        const statusFilter = document.getElementById('statusFilter');
        const companyFilter = document.getElementById('companyFilter');
        const gsmFilter = document.getElementById('gsmFilter');
        const widthFilter = document.getElementById('widthFilter');
        const lengthFilter = document.getElementById('lengthFilter');
        const lotNoFilter = document.getElementById('lotNoFilter');
        const jobNameFilter = document.getElementById('jobNameFilter');

        // Reset all filter values
        if (searchInput) searchInput.value = '';
        if (materialFilter) materialFilter.value = '';
        if (statusFilter) statusFilter.value = '';
        if (companyFilter) companyFilter.value = '';
        if (gsmFilter) gsmFilter.value = '';
        if (widthFilter) widthFilter.value = '';
        if (lengthFilter) lengthFilter.value = '';
        if (lotNoFilter) lotNoFilter.value = '';
        if (jobNameFilter) jobNameFilter.value = '';

        // Reset filtered stock to show all rolls
        this.filteredStock = [...this.currentStock];
        this.displayStock(this.filteredStock);
        
        this.showMessage('All filters cleared', 'success');
        console.log('All filters cleared - showing all rolls');
    }    // Roll Actions
    printRoll(id) {
        const roll = this.currentStock.find(r => r.id == id);
        if (!roll) {
            this.showMessage('Roll not found', 'error');
            return;
        }

        try {
            // Generate print window with roll details
            const printWindow = window.open('', '_blank', 'width=800,height=600');
            
            // Format date for display
            const formatDate = (dateString) => {
                if (!dateString) return 'N/A';
                try {
                    return new Date(dateString).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                } catch (e) {
                    return dateString;
                }
            };

            // Calculate square meter
            const squareMeter = this.calculateSquareMeter(roll.width, roll.length);
            
            // Generate print content
            const printContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Roll Details - ${roll.rollnumber}</title>
                    <style>
                        body { 
                            font-family: Arial, sans-serif; 
                            margin: 20px; 
                            line-height: 1.6;
                            color: #333;
                        }
                        .header { 
                            text-align: center; 
                            margin-bottom: 30px;
                            border-bottom: 2px solid #007bff;
                            padding-bottom: 20px;
                        }
                        .company-name {
                            font-size: 24px;
                            font-weight: bold;
                            color: #007bff;
                            margin-bottom: 5px;
                        }
                        .roll-title {
                            font-size: 20px;
                            color: #333;
                            margin: 10px 0;
                        }
                        .details { 
                            margin: 20px 0; 
                        }
                        .details table { 
                            width: 100%; 
                            border-collapse: collapse;
                            margin-top: 20px;
                        }
                        .details th, .details td { 
                            border: 1px solid #ddd; 
                            padding: 12px; 
                            text-align: left; 
                        }
                        .details th { 
                            background-color: #f8f9fa; 
                            font-weight: bold;
                            color: #495057;
                            width: 40%;
                        }
                        .details td {
                            background-color: #fff;
                        }
                        .status-badge {
                            padding: 4px 8px;
                            border-radius: 4px;
                            color: white;
                            font-weight: bold;
                        }
                        .status-stock { background-color: #28a745; }
                        .status-printing { background-color: #ffc107; color: #000; }
                        .status-used { background-color: #dc3545; }
                        .status-original { background-color: #6f42c1; }
                        .footer {
                            margin-top: 40px;
                            text-align: center;
                            font-size: 12px;
                            color: #666;
                            border-top: 1px solid #ddd;
                            padding-top: 20px;
                        }
                        @media print {
                            body { margin: 0; }
                            .no-print { display: none; }
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div class="company-name">Shree Label</div>
                        <div class="roll-title">Paper Roll Details</div>
                        <div class="roll-title">Roll Number: ${this.escapeHtml(roll.rollnumber)}</div>
                    </div>
                    
                    <div class="details">
                        <table>
                            <tr>
                                <th>Roll Number</th>
                                <td>${this.escapeHtml(roll.rollnumber || 'N/A')}</td>
                            </tr>
                            <tr>
                                <th>Status</th>
                                <td>
                                    <span class="status-badge status-${(roll.status || 'stock').toLowerCase()}">
                                        ${this.getDisplayStatus(roll.status)}
                                    </span>
                                </td>
                            </tr>
                            <tr>
                                <th>Material</th>
                                <td>${this.escapeHtml(roll.material || 'N/A')}</td>
                            </tr>
                            <tr>
                                <th>Paper Company</th>
                                <td>${this.escapeHtml(roll.papercompany || 'N/A')}</td>
                            </tr>
                            <tr>
                                <th>GSM</th>
                                <td>${this.escapeHtml(roll.gsm || 'N/A')} ${roll.gsm ? 'gsm' : ''}</td>
                            </tr>
                            <tr>
                                <th>Width</th>
                                <td>${this.escapeHtml(roll.width || 'N/A')} ${roll.width ? 'mm' : ''}</td>
                            </tr>
                            <tr>
                                <th>Length</th>
                                <td>${this.escapeHtml(roll.length || 'N/A')} ${roll.length ? 'm' : ''}</td>
                            </tr>
                            <tr>
                                <th>Square Meter</th>
                                <td>${squareMeter.toFixed(2)} sq.m</td>
                            </tr>
                            <tr>
                                <th>Weight</th>
                                <td>${this.escapeHtml(roll.weight || 'N/A')} ${roll.weight ? 'kg' : ''}</td>
                            </tr>
                            <tr>
                                <th>Lot Number</th>
                                <td>${this.escapeHtml((roll.lotno && roll.lotno !== '0' && roll.lotno !== 0 && roll.lotno.toString().trim() !== '') ? roll.lotno : 'N/A')}</td>
                            </tr>
                            <tr>
                                <th>Job Name</th>
                                <td>${this.escapeHtml(roll.jobname || 'N/A')}</td>
                            </tr>
                            <tr>
                                <th>Job Number</th>
                                <td>${this.escapeHtml(roll.jobno || 'N/A')}</td>
                            </tr>
                            <tr>
                                <th>Job Size</th>
                                <td>${this.escapeHtml(roll.jobsize || 'N/A')}</td>
                            </tr>
                            <tr>
                                <th>Date Added</th>
                                <td>${formatDate(roll.date_added)}</td>
                            </tr>
                        </table>
                    </div>
                    
                    <div class="footer">
                        <p>Generated on: ${new Date().toLocaleString('en-IN')}</p>
                        <p>Paper Stock Management System - Shree Label</p>
                    </div>
                    
                    <script>
                        // Auto print when page loads
                        window.onload = function() {
                            window.print();
                        };
                        
                        // Close window after printing (optional)
                        window.onafterprint = function() {
                            // Uncomment the line below if you want to auto-close the print window
                            // window.close();
                        };
                    </script>
                </body>
                </html>
            `;

            // Write content to print window
            printWindow.document.write(printContent);
            printWindow.document.close();
            
            // Show success message
            this.showMessage(`Print dialog opened for roll: ${roll.rollnumber}`, 'success');
            
            console.log(`Print window opened for roll: ${roll.rollnumber}`);
            
        } catch (error) {
            console.error('Error opening print window:', error);
            this.showMessage('Error opening print window. Please check if popups are allowed.', 'error');
        }
    }    editRoll(id) {
        const roll = this.currentStock.find(r => r.id == id);
        if (roll) {
            openEditModal(roll);
        } else {
            this.showMessage('Roll not found', 'error');
        }
    }    slitRoll(id) {
        const roll = this.currentStock.find(r => r.id == id);
        if (roll) {
            // Navigate to Multi Slit tab and pre-select the roll
            goToSlitTab(roll.rollnumber);
            this.showMessage(`Selected roll ${roll.rollnumber} for slitting`, 'info');
        }
    }deleteRoll(id) {
        if (!this.isAdminLoggedIn) {
            this.showMessage('Admin access required to delete rolls', 'error');
            return;
        }
        
        const roll = this.currentStock.find(r => r.id == id);
        if (roll) {
            openDeleteModal(roll.rollnumber);
        }
    }

    // Show Message
    showMessage(message, type = 'info') {
        console.log(`${type.toUpperCase()}: ${message}`);
        
        // Create message container if it doesn't exist
        let container = document.getElementById('messageContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'messageContainer';
            container.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 9999; max-width: 400px;';
            document.body.appendChild(container);
        }

        const alertClass = type === 'success' ? 'alert-success' :
                          type === 'error' ? 'alert-danger' :
                          type === 'warning' ? 'alert-warning' :
                          'alert-info';

        const alert = document.createElement('div');
        alert.className = `alert ${alertClass} alert-dismissible fade show`;
        alert.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-triangle' : 'info-circle'} me-2"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        container.appendChild(alert);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (alert.parentNode) {
                alert.remove();
            }
        }, 5000);
    }    // Sort Stock Data
    sortStock(column) {
        // Toggle sort direction if same column
        if (this.currentSort.column === column) {
            this.currentSort.direction = this.currentSort.direction === 'asc' ? 'desc' : 'asc';
        } else {
            this.currentSort.column = column;
            this.currentSort.direction = 'asc';
        }
          // Get data to sort (filtered or all)
        let dataToSort = this.filteredStock.length > 0 ? this.filteredStock : this.currentStock;
        
        // Sort the data
        dataToSort.sort((a, b) => {
            let valueA, valueB;
            
            switch (column) {
                case 'serial':
                    // For serial, use the index in the current dataset
                    const indexA = this.currentStock.indexOf(a);
                    const indexB = this.currentStock.indexOf(b);
                    valueA = indexA;
                    valueB = indexB;
                    break;
                case 'rollnumber':
                    valueA = (a.rollnumber || '').toString().toLowerCase();
                    valueB = (b.rollnumber || '').toString().toLowerCase();
                    break;
                case 'material':
                    valueA = (a.material || '').toString().toLowerCase();
                    valueB = (b.material || '').toString().toLowerCase();
                    break;
                case 'papercompany':
                    valueA = (a.papercompany || '').toString().toLowerCase();
                    valueB = (b.papercompany || '').toString().toLowerCase();
                    break;
                case 'gsm':
                    valueA = parseFloat(a.gsm) || 0;
                    valueB = parseFloat(b.gsm) || 0;
                    break;
                case 'width':
                    valueA = parseFloat(a.width) || 0;
                    valueB = parseFloat(b.width) || 0;
                    break;                case 'length':
                    valueA = parseFloat(a.length) || 0;
                    valueB = parseFloat(b.length) || 0;
                    break;
                case 'weight':
                    valueA = parseFloat(a.weight) || 0;
                    valueB = parseFloat(b.weight) || 0;
                    break;
                case 'status':
                    valueA = (a.status || '').toString().toLowerCase();
                    valueB = (b.status || '').toString().toLowerCase();
                    break;                case 'date_added':
                    valueA = new Date(a.date_added || 0);
                    valueB = new Date(b.date_added || 0);
                    break;
                default:
                    valueA = (a[column] || '').toString().toLowerCase();
                    valueB = (b[column] || '').toString().toLowerCase();
            }

            // Compare values
            let comparison = 0;
            if (valueA > valueB) {
                comparison = 1;
            } else if (valueA < valueB) {
                comparison = -1;
            }

            // Apply sort direction
            return this.currentSort.direction === 'asc' ? comparison : -comparison;
        });        // Update the display
        this.displayStock(dataToSort);
        this.updateSortIcons(column);
    }

    // Update Sort Icons
    updateSortIcons(activeColumn) {
        
        // Reset all sort icons
        const sortIcons = document.querySelectorAll('[id^="sort-"]');
        console.log(`Found ${sortIcons.length} sort icons`);
        sortIcons.forEach(icon => {
            console.log(`Resetting icon: ${icon.id}`);
            icon.className = 'fas fa-sort';
        });

        // Update active column icon
        const activeIcon = document.getElementById(`sort-${activeColumn}`);
        console.log(`Looking for icon: sort-${activeColumn}`);
        if (activeIcon) {
            console.log(`Found active icon: ${activeIcon.id}`);
            if (this.currentSort.direction === 'asc') {
                activeIcon.className = 'fas fa-sort-up';
                console.log(`Set icon to sort-up`);
            } else {
                activeIcon.className = 'fas fa-sort-down';
                console.log(`Set icon to sort-down`);
            }
        } else {
            console.error(`Active icon NOT found: sort-${activeColumn}`);
        }        console.log(`=== ICON UPDATE COMPLETE ===`);
    }

    // Excel Operations Methods
    uploadExcel() {
        const fileInput = document.getElementById('excelFile');
        const file = fileInput.files[0];

        if (!file) {
            this.showMessage('Please select a file to upload', 'error');
            return;
        }

        this.showMessage('Processing file...', 'info');

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const csv = e.target.result;
                const lines = csv.split('\n');
                const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());

                const importedData = [];
                for (let i = 1; i < lines.length; i++) {
                    if (lines[i].trim()) {
                        const values = lines[i].split(',').map(v => v.replace(/"/g, '').trim());
                        const roll = {};
                        headers.forEach((header, index) => {
                            roll[header] = values[index] || '';
                        });
                        if (roll['Roll Number']) {
                            importedData.push(roll);
                        }
                    }
                }

                if (importedData.length > 0) {
                    this.processImportedData(importedData);
                } else {
                    this.showMessage('No valid data found in file', 'warning');
                }
            } catch (error) {
                console.error('Error processing file:', error);
                this.showMessage('Error processing file. Please check format.', 'error');
            }
        };
        reader.readAsText(file);
    }

    async processImportedData(data) {
        if (!confirm(`Found ${data.length} rolls to import. Continue?`)) {
            return;
        }

        let imported = 0;
        let errors = 0;

        for (const rollData of data) {
            try {
                // Map CSV headers to database fields
                const roll = {
                    rollnumber: rollData['Roll Number'],
                    material: rollData['Material'],
                    papercompany: rollData['Paper Company'],
                    gsm: rollData['GSM'],
                    width: rollData['Width (mm)'],
                    length: rollData['Length (m)'],
                    weight: rollData['Weight (kg)'],
                    lotno: rollData['Lot No'],
                    squaremeter: rollData['Square Meter'],
                    rolltype: rollData['Roll Type'],
                    status: rollData['Status'] || 'Stock',
                    jobname: rollData['Job Name'],
                    jobno: rollData['Job No'],
                    jobsize: rollData['Job Size']
                };

                const response = await fetch('api/add_roll.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(roll)
                });

                const result = await response.json();
                if (result.success) {
                    imported++;
                } else {
                    errors++;
                    console.error('Import error:', result.message);
                }
            } catch (error) {
                errors++;
                console.error('Import error:', error);
            }
        }

        this.showMessage(`Import completed: ${imported} successful, ${errors} errors`, 'info');
        this.loadStock(); // Reload stock data
    }

    downloadTemplate() {
        const templateData = [
            {
                'Roll Number': 'SAMPLE001',
                'Material': 'Chromo',
                'Paper Company': 'Camline',
                'GSM': '120',
                'Width (mm)': '1000',
                'Length (m)': '2000',
                'Weight (kg)': '10',
                'Lot No': 'LOT001',
                'Square Meter': '2000',
                'Roll Type': 'Mother Roll',
                'Status': 'Stock',
                'Job Name': '',
                'Job No': '',
                'Job Size': '',
                'Date Added': this.formatDate(new Date())
            }
        ];

        const csv = this.convertToCSV(templateData);
        this.downloadCSV(csv, 'paper_stock_template.csv');
        this.showMessage('Template downloaded successfully', 'success');
    }

    async backupDatabase() {
        this.showMessage('Initiating database backup...', 'info');
        
        try {
            const response = await fetch('api/backup_database.php');
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `stock_backup_${new Date().toISOString().split('T')[0]}.sql`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                this.showMessage('Database backup downloaded successfully', 'success');
            } else {
                throw new Error('Backup failed');
            }
        } catch (error) {
            console.error('Backup error:', error);
            this.showMessage('Error creating database backup', 'error');
        }
    }

    async restoreDatabase() {
        const fileInput = document.getElementById('backupFile');
        const file = fileInput.files[0];

        if (!file) {
            this.showMessage('Please select a backup file to restore', 'error');
            return;
        }

        if (!confirm('This will replace all current data. Are you sure you want to restore from backup?')) {
            return;
        }

        const formData = new FormData();
        formData.append('backupFile', file);

        this.showMessage('Restoring database...', 'info');

        try {
            const response = await fetch('api/restore_database.php', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            if (result.success) {
                this.showMessage('Database restored successfully', 'success');
                this.loadStock(); // Reload stock data
            } else {
                this.showMessage('Error restoring database: ' + result.message, 'error');
            }
        } catch (error) {
            console.error('Restore error:', error);
            this.showMessage('Error restoring database', 'error');
        }
    }

    // Utility methods for Excel operations
    convertToCSV(data) {
        if (!data || data.length === 0) {
            return '';
        }
        
        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => headers.map(header => `"${(row[header] || '').toString().replace(/"/g, '""')}"`).join(','))
        ].join('\n');
        return csvContent;
    }

    downloadCSV(csv, filename) {
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }

    formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    }
}

// Utility function to validate and get lotNo value
function validateAndGetLotNo(fieldId) {
    const field = document.getElementById(fieldId);
    if (!field) return 'N/A';
    
    let lotNoValue = field.value.trim();
    
    // Return the trimmed value, or 'N/A' if empty
    return lotNoValue === '' ? 'N/A' : lotNoValue;
}

// Enhanced functions for material/company handling
function handleMaterialChange() {
    const materialSelect = document.getElementById('material');
    const customMaterialInput = document.getElementById('customMaterial');
    
    if (materialSelect && customMaterialInput) {
        if (materialSelect.value === 'Custom') {
            customMaterialInput.classList.remove('d-none');
            customMaterialInput.required = true;
        } else {
            customMaterialInput.classList.add('d-none');
            customMaterialInput.required = false;
            customMaterialInput.value = '';
        }
    }
}

function handleCompanyChange() {
    const companySelect = document.getElementById('paperCompany');
    const customCompanyInput = document.getElementById('customCompany');
    
    if (companySelect && customCompanyInput) {
        if (companySelect.value === 'Custom') {
            customCompanyInput.classList.remove('d-none');
            customCompanyInput.required = true;
        } else {
            customCompanyInput.classList.add('d-none');
            customCompanyInput.required = false;
            customCompanyInput.value = '';
        }
    }
}

function calculateSquareMeter() {
    const widthInput = document.getElementById('width');
    const lengthInput = document.getElementById('length');
    const squareMeterInput = document.getElementById('squareMeter');
    
    if (widthInput && lengthInput && squareMeterInput) {
        const width = parseFloat(widthInput.value) || 0;
        const length = parseFloat(lengthInput.value) || 0;
        const squareMeter = (width * length) / 1000;
        squareMeterInput.value = squareMeter.toFixed(2);
    }
}

// Enhanced add roll form handler
async function handleAddRoll(event) {
    event.preventDefault();
    
    const rollNumber = document.getElementById('rollNumber').value;
    const material = document.getElementById('material').value === 'Custom' 
        ? document.getElementById('customMaterial').value 
        : document.getElementById('material').value;
    const paperCompany = document.getElementById('paperCompany').value === 'Custom' 
        ? document.getElementById('customCompany').value 
        : document.getElementById('paperCompany').value;
    const gsm = parseInt(document.getElementById('gsm').value);
    const width = parseInt(document.getElementById('width').value);
    const length = parseInt(document.getElementById('length').value);    const weight = parseFloat(document.getElementById('weight').value);
    
    // Use the utility function for lotNo validation
    let lotNo;
    try {
        lotNo = validateAndGetLotNo('lotNo');
    } catch (error) {
        return; // Stop form submission if validation fails
    }
    
    const rollData = {
        rollNumber,
        material,
        paperCompany,
        gsm,
        width,
        length,
        weight,
        lotNo
    };
    
    try {
        const response = await fetch('api/add_roll.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(rollData)
        });
        
        const result = await response.json();          if (result.success) {
            alert('Roll added successfully!');
            document.getElementById('addRollForm').reset();
            calculateSquareMeter(); // Reset square meter calculation
            if (app) app.loadStock(); // Reload stock data
            
            // Auto-redirect to View Stock tab
            const viewStockTab = document.getElementById('view-stock-tab');
            if (viewStockTab) {
                const tabInstance = new bootstrap.Tab(viewStockTab);
                tabInstance.show();
            }
        } else {
            alert('Error: ' + result.message);
        }
    } catch (error) {
        console.error('Error adding roll:', error);
        alert('Error adding roll. Please try again.');
    }
}

// Enhanced modal functions
function openEditModal(roll) {
    // Populate edit form with roll data
    document.getElementById('editRollId').value = roll.id;
    document.getElementById('editRollNumber').value = roll.rollnumber;
    document.getElementById('editMaterial').value = roll.material;
    document.getElementById('editPaperCompany').value = roll.papercompany;
    document.getElementById('editGsm').value = roll.gsm;
    document.getElementById('editWidth').value = roll.width;
    document.getElementById('editLength').value = roll.length;
    document.getElementById('editWeight').value = roll.weight;
    document.getElementById('editLotNo').value = roll.lotno || '';
    document.getElementById('editStatus').value = roll.status;
    document.getElementById('editJobName').value = roll.jobname || '';
    document.getElementById('editJobNo').value = roll.jobno || '';
    document.getElementById('editJobSize').value = roll.jobsize || '';
      // Reset slitting section
    document.getElementById('enableSlitting').checked = false;
    document.getElementById('slittingSection').classList.add('d-none');
    
    // Clear existing slit inputs
    const slitContainer = document.getElementById('slitInputsEdit');
    if (slitContainer) {
        slitContainer.innerHTML = '';
    }
    
    // Add event listener for slitting checkbox
    const enableSlittingCheckbox = document.getElementById('enableSlitting');
    if (enableSlittingCheckbox) {
        enableSlittingCheckbox.onchange = function() {
            const slittingSection = document.getElementById('slittingSection');
            if (this.checked) {
                slittingSection.classList.remove('d-none');
                // Add first slit input if none exist
                if (slitContainer && slitContainer.children.length === 0) {
                    addSlitInputEdit();
                } else if (typeof updateSlitSuffixes === 'function') {
                    updateSlitSuffixes();
                }
            } else {
                slittingSection.classList.add('d-none');
            }
        };
    }
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('editModal'));
    modal.show();
}

async function saveEditRoll(event) {
    event.preventDefault();
    
    const rollData = {
        id: document.getElementById('editRollId').value,
        rollNumber: document.getElementById('editRollNumber').value,
        material: document.getElementById('editMaterial').value,
        paperCompany: document.getElementById('editPaperCompany').value,
        gsm: parseInt(document.getElementById('editGsm').value),        width: parseInt(document.getElementById('editWidth').value),
        length: parseInt(document.getElementById('editLength').value),
        weight: parseFloat(document.getElementById('editWeight').value),
        lotNo: validateAndGetLotNo('editLotNo'),
        status: document.getElementById('editStatus').value,
        jobName: document.getElementById('editJobName').value,
        jobNo: document.getElementById('editJobNo').value,
        jobSize: document.getElementById('editJobSize').value
    };
      // Check if slitting is enabled
    if (document.getElementById('enableSlitting').checked) {
        const slitInputs = document.querySelectorAll('#slitInputsEdit .slit-input-group');
        const slits = [];
          slitInputs.forEach(group => {
            const width = group.querySelector('.slit-width').value;
            const length = group.querySelector('.slit-length').value;
            const status = group.querySelector('.slit-status').value;
            const suffix = group.querySelector('.slit-suffix').value;
            
            if (width && length && suffix) {
                slits.push({ 
                    width: parseFloat(width), 
                    length: parseFloat(length), 
                    status,
                    suffix
                });
            }
        });
        
        if (slits.length > 0) {
            // Call slitting API instead of regular update
            try {
                const slitResponse = await fetch('api/process_slit_edit.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        original_roll_id: rollData.id,
                        rollData: rollData,
                        slits: slits
                    })
                });
                
                const slitResult = await slitResponse.json();
                
                if (slitResult.success) {
                    alert('Roll slit successfully!');
                    bootstrap.Modal.getInstance(document.getElementById('editModal')).hide();
                    if (app) app.loadStock(); // Reload stock data
                } else {
                    alert('Error slitting roll: ' + slitResult.message);
                }
                return; // Exit early for slitting
            } catch (error) {
                console.error('Error slitting roll:', error);
                alert('Error slitting roll. Please try again.');
                return;
            }
        }
    }
    
    try {
        const response = await fetch('api/update_roll.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(rollData)
        });
        
        const result = await response.json();
          if (result.success) {
            alert('Roll updated successfully!');
            bootstrap.Modal.getInstance(document.getElementById('editModal')).hide();
            if (app) app.loadStock(); // Reload stock data
        } else {
            alert('Error: ' + result.message);
        }
    } catch (error) {
        console.error('Error updating roll:', error);
        alert('Error updating roll. Please try again.');
    }
}

// Slitting functions
function addSlitInputEdit() {
    const container = document.getElementById('slitInputsEdit');
    const currentSlitCount = container.querySelectorAll('.slit-input-group').length;
    const originalRollNumber = document.getElementById('editRollNumber').value;
    const originalLength = parseFloat(document.getElementById('editLength').value) || 0;
    const originalWidth = parseFloat(document.getElementById('editWidth').value) || 0;
    
    // Calculate remaining width after existing slits
    let totalUsedWidth = 0;
    const existingSlits = container.querySelectorAll('.slit-input-group');
    existingSlits.forEach(slit => {
        const width = parseFloat(slit.querySelector('.slit-width').value) || 0;
        totalUsedWidth += width;
    });
    
    const remainingWidth = Math.max(0, originalWidth - totalUsedWidth);    // Calculate default values
    const defaultLength = originalLength;
    // Use remaining width for new slit (or original width if first slit and no existing slits)
    const defaultWidth = remainingWidth > 0 ? remainingWidth : (currentSlitCount === 0 ? originalWidth : 0);
    const newRollNumber = `${originalRollNumber}-${currentSlitCount + 1}`;
    
    const newGroup = document.createElement('div');
    newGroup.className = 'slit-input-group mb-3';
    newGroup.innerHTML = `
        <div class="row">
            <div class="col-md-2">
                <label class="form-label">Width (mm)</label>
                <input type="number" class="form-control slit-width" placeholder="Width" 
                       value="${defaultWidth}" min="1" step="0.1" 
                       onchange="calculateRemainingDimensionsEdit(); validateDimensionsEdit(this)">
            </div>
            <div class="col-md-2">
                <label class="form-label">Length (m)</label>
                <input type="number" class="form-control slit-length" placeholder="Length" 
                       value="${defaultLength}" min="1" step="0.01" 
                       onchange="calculateRemainingDimensionsEdit(); validateDimensionsEdit(this)">
            </div>
            <div class="col-md-2">
                <label class="form-label">Status</label>
                <select class="form-select slit-status" onchange="calculateRemainingDimensionsEdit()">
                    <option value="Stock" ${currentSlitCount > 0 ? 'selected' : ''}>Stock</option>
                    <option value="Printing" ${currentSlitCount === 0 ? 'selected' : ''}>Printing</option>
                </select>
            </div>
            <div class="col-md-3">
                <label class="form-label">New Roll Number</label>
                <input type="text" class="form-control slit-suffix" value="${newRollNumber}" readonly>
            </div>
            <div class="col-md-3 d-flex align-items-end">
                <button type="button" class="btn btn-danger btn-sm" onclick="removeSlitInputEdit(this)">Remove</button>
            </div>
        </div>    `;
    container.appendChild(newGroup);
    calculateRemainingDimensionsEdit();
}

function removeSlitInputEdit(button) {
    button.closest('.slit-input-group').remove();
    updateSlitSuffixes();
    calculateRemainingDimensionsEdit();
}

function updateSlitSuffixes() {
    const container = document.getElementById('slitInputsEdit');
    const slitGroups = container.querySelectorAll('.slit-input-group');
    const originalRollNumber = document.getElementById('editRollNumber').value;
    
    slitGroups.forEach((group, index) => {
        const suffixInput = group.querySelector('.slit-suffix');
        if (suffixInput) {
            const suffixNumber = index + 1;
            suffixInput.value = `${originalRollNumber}-${suffixNumber}`;
        }
    });
}

// Calculate remaining dimensions for edit modal slitting
function calculateRemainingDimensionsEdit() {
    const originalRollNumber = document.getElementById('editRollNumber').value;
    const originalWidth = parseFloat(document.getElementById('editWidth').value) || 0;
    const originalLength = parseFloat(document.getElementById('editLength').value) || 0;
    
    if (!originalRollNumber || !originalWidth || !originalLength) {
        return { width: 0, length: 0 };
    }

    const container = document.getElementById('slitInputsEdit');
    const inputs = container.querySelectorAll('.slit-input-group');

    let totalUsedWidth = 0;

    inputs.forEach(input => {
        const widthInput = input.querySelector('.slit-width');
        if (widthInput) {
            const width = parseFloat(widthInput.value) || 0;
            totalUsedWidth += width;
        }
    });

    // Calculate remaining dimensions
    const remainingWidth = Math.max(0, originalWidth - totalUsedWidth);
    const remainingLength = originalLength; // Length stays same in edit modal slitting
    
    // Debug logging
    console.log('Width calculation debug:', {
        originalWidth,
        totalUsedWidth,
        remainingWidth,
        slitCount: inputs.length
    });

    // Update remaining display
    const remainingDisplay = document.getElementById('slitRemainingDisplayEdit');
    if (remainingDisplay) {
        const widthClass = remainingWidth <= 0 ? 'text-danger fw-bold' : (remainingWidth < originalWidth * 0.1 ? 'text-warning fw-bold' : 'text-dark fw-bold');
        const lengthClass = 'text-dark fw-bold'; // Length doesn't change in edit modal slitting
        
        remainingDisplay.innerHTML = `
            <div class="alert alert-light border">
                <small>
                    <strong class="text-dark">Remaining Dimensions:</strong><br>
                    <span class="${widthClass}">Width: ${remainingWidth.toFixed(1)}mm</span> | 
                    <span class="${lengthClass}">Length: ${remainingLength.toFixed(1)}m</span>
                </small>
            </div>
        `;
        
        // Also show remaining part roll number
        if (remainingWidth > 0) {
            const nextSlitNumber = inputs.length + 1;
            remainingDisplay.innerHTML += `
                <div class="alert alert-info mt-2">
                    <small>
                        <strong>Remaining part will be:</strong> ${originalRollNumber}-${nextSlitNumber}
                    </small>
                </div>
            `;
        }
    }

    return { width: remainingWidth, length: remainingLength };
}

// Validate dimensions for edit modal slitting
function validateDimensionsEdit(input) {
    const originalWidth = parseFloat(document.getElementById('editWidth').value) || 0;
    const originalLength = parseFloat(document.getElementById('editLength').value) || 0;
    
    if (!originalWidth || !originalLength) return true;
    
    const inputValue = parseFloat(input.value) || 0;
    const isWidthField = input.classList.contains('slit-width');
    const isLengthField = input.classList.contains('slit-length');
    
    // Remove any previous validation classes
    input.classList.remove('is-invalid', 'border-danger');
    
    // Validate individual field against original dimensions
    if (isWidthField && inputValue > originalWidth) {
        input.classList.add('is-invalid', 'border-danger');
        if (typeof app !== 'undefined' && app.showMessage) {
            app.showMessage(`Width ${inputValue}mm exceeds original roll width ${originalWidth}mm`, 'error');
        } else {
            alert(`Width ${inputValue}mm exceeds original roll width ${originalWidth}mm`);
        }
        return false;
    }
    
    if (isLengthField && inputValue > originalLength) {
        input.classList.add('is-invalid', 'border-danger');
        if (typeof app !== 'undefined' && app.showMessage) {
            app.showMessage(`Length ${inputValue}m exceeds original roll length ${originalLength}m`, 'error');
        } else {
            alert(`Length ${inputValue}m exceeds original roll length ${originalLength}m`);
        }
        return false;
    }
    
    // Check total width usage for width fields
    if (isWidthField) {
        const container = document.getElementById('slitInputsEdit');
        const slitInputs = container.querySelectorAll('.slit-input-group');
        let totalUsedWidth = 0;
        
        slitInputs.forEach(group => {
            const widthInput = group.querySelector('.slit-width');
            const width = parseFloat(widthInput.value) || 0;
            totalUsedWidth += width;
        });
        
        if (totalUsedWidth > originalWidth) {
            input.classList.add('is-invalid', 'border-danger');
            if (typeof app !== 'undefined' && app.showMessage) {
                app.showMessage(`Total width ${totalUsedWidth}mm exceeds original roll width ${originalWidth}mm`, 'error');
            } else {
                alert(`Total width ${totalUsedWidth}mm exceeds original roll width ${originalWidth}mm`);
            }
            return false;
        }
    }
    
    return true;
}

// Delete functions
let rollToDelete = null;

function openDeleteModal(rollNumber) {
    rollToDelete = rollNumber;
    document.getElementById('deleteRollNumber').textContent = rollNumber;
    const modal = new bootstrap.Modal(document.getElementById('deleteModal'));
    modal.show();
}

async function confirmDelete() {
    if (!rollToDelete) return;
    
    try {
        const response = await fetch('api/delete_roll.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ rollNumber: rollToDelete })
        });
        
        const result = await response.json();
          if (result.success) {
            alert('Roll deleted successfully!');
            bootstrap.Modal.getInstance(document.getElementById('deleteModal')).hide();
            if (app) app.loadStock(); // Reload stock data
        } else {
            alert('Error: ' + result.message);
        }
    } catch (error) {
        console.error('Error deleting roll:', error);
        alert('Error deleting roll. Please try again.');
    }
    
    rollToDelete = null;
}

// Delete All Stock Rolls functions
function showDeleteAllModal() {
    if (!app || !app.isAdminLoggedIn) {
        alert('Only admin users can delete all stock rolls. Please login as admin.');
        return;
    }

    // Reset checkbox and button state
    const checkbox = document.getElementById('confirmDeleteAll');
    const button = document.getElementById('confirmDeleteAllBtn');
    if (checkbox) checkbox.checked = false;
    if (button) button.disabled = true;

    const modal = new bootstrap.Modal(document.getElementById('deleteAllModal'));
    modal.show();
}

async function confirmDeleteAll() {
    if (!app || !app.isAdminLoggedIn) {
        alert('Only admin users can delete all stock rolls.');
        return;
    }

    try {
        const response = await fetch('api/delete_all_rolls.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ action: 'delete_all' })
        });

        const result = await response.json();

        // Hide modal first
        const modal = bootstrap.Modal.getInstance(document.getElementById('deleteAllModal'));
        if (modal) {
            modal.hide();
        }

        if (result.success) {
            alert('All stock rolls deleted successfully');
            if (app) app.loadStock(); // Reload stock data
        } else {
            alert('Error: ' + (result.message || 'Error deleting all stock rolls'));
        }
    } catch (error) {
        console.error('Error deleting all stock rolls:', error);
        alert('Error deleting all stock rolls. Please try again.');
        // Hide modal on error too
        const modal = bootstrap.Modal.getInstance(document.getElementById('deleteAllModal'));
        if (modal) {
            modal.hide();
        }
    }
}

// Excel Operations Functions
function exportToExcel() {
    if (!app || !app.currentStock || app.currentStock.length === 0) {
        if (app) app.showMessage('No data to export', 'warning');
        return;
    }

    const data = app.currentStock.map(roll => ({
        'Roll Number': roll.rollnumber || '',
        'Material': roll.material || '',
        'Paper Company': roll.papercompany || '',
        'GSM': roll.gsm || '',
        'Width (mm)': roll.width || '',
        'Length (m)': roll.length || '',
        'Weight (kg)': roll.weight || '',
        'Lot No': roll.lotno || '',
        'Square Meter': roll.squaremeter || '',
        'Roll Type': roll.rolltype || '',
        'Status': roll.status || '',
        'Job Name': roll.jobname || '',
        'Job No': roll.jobno || '',
        'Job Size': roll.jobsize || '',
        'Date Added': formatDate(roll.date_added) || ''
    }));

    const csv = convertToCSV(data);
    downloadCSV(csv, `stock_export_${new Date().toISOString().split('T')[0]}.csv`);
    if (app) app.showMessage('Stock data exported successfully', 'success');
}

function downloadTemplate() {
    const templateData = [
        {
            'Roll Number': 'SAMPLE001',
            'Material': 'Chromo',
            'Paper Company': 'Camline',
            'GSM': '120',
            'Width (mm)': '1000',
            'Length (m)': '2000',
            'Weight (kg)': '10',
            'Lot No': 'LOT001',
            'Square Meter': '2000',
            'Roll Type': 'Mother Roll',
            'Status': 'Stock',
            'Job Name': '',
            'Job No': '',
            'Job Size': '',
            'Date Added': formatDate(new Date())
        }
    ];

    const csv = convertToCSV(templateData);
    downloadCSV(csv, 'paper_stock_template.csv');
    if (app) app.showMessage('Template downloaded successfully', 'success');
}

function uploadExcel() {
    const fileInput = document.getElementById('excelFile');
    const file = fileInput.files[0];

    if (!file) {
        if (app) app.showMessage('Please select a file to upload', 'error');
        return;
    }

    if (app) app.showMessage('Processing file...', 'info');

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const csv = e.target.result;
            const lines = csv.split('\n');
            const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());

            const importedData = [];
            for (let i = 1; i < lines.length; i++) {
                if (lines[i].trim()) {
                    const values = lines[i].split(',').map(v => v.replace(/"/g, '').trim());
                    const roll = {};
                    headers.forEach((header, index) => {
                        roll[header] = values[index] || '';
                    });
                    if (roll['Roll Number']) {
                        importedData.push(roll);
                    }
                }
            }

            processImportedData(importedData);
        } catch (error) {
            console.error('Error processing file:', error);
            if (app) app.showMessage('Error processing file. Please check format.', 'error');
        }
    };

    reader.readAsText(file);
}

function processImportedData(data) {
    if (!confirm(`Found ${data.length} rolls to import. Continue?`)) {
        return;
    }

    let imported = 0;
    let errors = 0;

    data.forEach(async (rollData) => {
        try {
            // Map CSV headers to database fields
            const roll = {
                rollnumber: rollData['Roll Number'],
                material: rollData['Material'],
                papercompany: rollData['Paper Company'],
                gsm: rollData['GSM'],
                width: rollData['Width (mm)'],
                length: rollData['Length (m)'],
                weight: rollData['Weight (kg)'],
                lotno: rollData['Lot No'],
                squaremeter: rollData['Square Meter'],
                rolltype: rollData['Roll Type'],
                status: rollData['Status'] || 'Stock',
                jobname: rollData['Job Name'],
                jobno: rollData['Job No'],
                jobsize: rollData['Job Size']
            };

            const response = await fetch('api/add_roll.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(roll)
            });

            const result = await response.json();
            if (result.success) {
                imported++;
            } else {
                errors++;
                console.error('Import error:', result.message);
            }
        } catch (error) {
            errors++;
            console.error('Import error:', error);
        }
    });

    // Show results after a delay to allow processing
    setTimeout(() => {
        if (app) {
            app.showMessage(`Import completed: ${imported} successful, ${errors} errors`, 'info');
            app.loadStock(); // Reload stock data
        }
    }, 2000);
}

function backupDatabase() {
    if (app) app.showMessage('Initiating database backup...', 'info');
    
    fetch('api/backup_database.php')
        .then(response => {
            if (response.ok) {
                return response.blob();
            }
            throw new Error('Backup failed');
        })
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `stock_backup_${new Date().toISOString().split('T')[0]}.sql`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            if (app) app.showMessage('Database backup downloaded successfully', 'success');
        })
        .catch(error => {
            console.error('Backup error:', error);
            if (app) app.showMessage('Error creating database backup', 'error');
        });
}

function restoreDatabase() {
    const fileInput = document.getElementById('backupFile');
    const file = fileInput.files[0];

    if (!file) {
        if (app) app.showMessage('Please select a backup file to restore', 'error');
        return;
    }

    if (!confirm('This will replace all current data. Are you sure you want to restore from backup?')) {
        return;
    }

    const formData = new FormData();
    formData.append('backupFile', file);

    if (app) app.showMessage('Restoring database...', 'info');

    fetch('api/restore_database.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            if (app) {
                app.showMessage('Database restored successfully', 'success');
                app.loadStock(); // Reload stock data
            }
        } else {
            if (app) app.showMessage('Error restoring database: ' + result.message, 'error');
        }
    })
    .catch(error => {
        console.error('Restore error:', error);
        if (app) app.showMessage('Error restoring database', 'error');
    });
}

// Password Change Functions

// Show change password modal
function showChangePasswordModal() {
    console.log('Opening change password modal...');
    
    // Show the modal
    const modalElement = document.getElementById('changePasswordModal');
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
}

// Change password function
async function changePassword() {
    console.log('changePassword function called');
    
    // Get elements first to ensure they exist
    const currentPasswordElement = document.getElementById('currentPassword');
    const newPasswordElement = document.getElementById('newPassword');
    const confirmPasswordElement = document.getElementById('confirmPassword');
    const messageDiv = document.getElementById('passwordChangeMessage');
    
    // Debug element existence
    console.log('Password elements found:', {
        currentPassword: !!currentPasswordElement,
        newPassword: !!newPasswordElement,
        confirmPassword: !!confirmPasswordElement,
        messageDiv: !!messageDiv
    });
    
    if (!currentPasswordElement || !newPasswordElement || !confirmPasswordElement) {
        console.error('Password input elements not found!');
        if (messageDiv) {
            messageDiv.className = 'alert alert-danger';
            messageDiv.textContent = 'Password form elements not found. Please refresh the page.';
            messageDiv.classList.remove('d-none');
        }
        return;
    }
    
    // Get values and ensure they're strings
    const currentPassword = String(currentPasswordElement.value || '');
    const newPassword = String(newPasswordElement.value || '');
    const confirmPassword = String(confirmPasswordElement.value || '');
    console.log('Field values:', {
        currentPassword: currentPassword ? '[HIDDEN]' : 'EMPTY',
        newPassword: newPassword ? '[HIDDEN]' : 'EMPTY',
        confirmPassword: confirmPassword ? '[HIDDEN]' : 'EMPTY',
        currentPasswordLength: currentPassword.length,
        newPasswordLength: newPassword.length,
        confirmPasswordLength: confirmPassword.length
    });
    
    // Clear previous messages
    messageDiv.classList.add('d-none');
    
    // Validate form data
    if (!currentPassword || !newPassword || !confirmPassword) {
        console.log('Validation failed: Missing required fields');
        showPasswordMessage('All fields are required. Please make sure you have entered values in all password fields.', 'danger');
        
        // Highlight empty fields
        if (!currentPassword) currentPasswordElement.classList.add('is-invalid');
        if (!newPassword) newPasswordElement.classList.add('is-invalid');
        if (!confirmPassword) confirmPasswordElement.classList.add('is-invalid');
        
        return;
    }
    
    // Remove validation classes if values are present
    currentPasswordElement.classList.remove('is-invalid');
    newPasswordElement.classList.remove('is-invalid');
    confirmPasswordElement.classList.remove('is-invalid');
    
    if (newPassword.length < 6) {
        console.log('Validation failed: Password too short');
        showPasswordMessage('New password must be at least 6 characters long', 'danger');
        newPasswordElement.classList.add('is-invalid');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        console.log('Validation failed: Passwords do not match');
        showPasswordMessage('New password and confirmation do not match', 'danger');
        newPasswordElement.classList.add('is-invalid');
        confirmPasswordElement.classList.add('is-invalid');
        return;
    }
    
    console.log('Validation passed, sending request to API...');
    
    try {
        const response = await fetch('api/change_password.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                current_password: currentPassword,
                new_password: newPassword
            })
        });
        
        const result = await response.json();
        console.log('API response:', result);
        
        if (result.success) {
            showPasswordMessage('Password changed successfully!', 'success');
            
            // Clear form after successful change
            setTimeout(() => {
                document.getElementById('changePasswordForm').reset();
                const modal = bootstrap.Modal.getInstance(document.getElementById('changePasswordModal'));
                modal.hide();
            }, 2000);
        } else {
            showPasswordMessage(result.message || 'Failed to change password', 'danger');
        }
    } catch (error) {
        console.error('Error changing password:', error);
        showPasswordMessage('Error connecting to server', 'danger');
    }
}

// Helper function to show password change messages
function showPasswordMessage(message, type) {
    const messageDiv = document.getElementById('passwordChangeMessage');
    messageDiv.className = `alert alert-${type}`;
    messageDiv.textContent = message;
    messageDiv.classList.remove('d-none');
}

// Global functions called by HTML event handlers

// Generate report function called by HTML onchange events
function generateReport() {
    if (window.stockReportManager) {
        window.stockReportManager.generateReport();
    } else {
        console.warn('StockReportManager not initialized');
    }
}

// Display report function for manual calls
function displayReport(reportType, data) {
    if (window.stockReportManager) {
        window.stockReportManager.displayReport(reportType, data);
    } else {
        console.warn('StockReportManager not initialized');
    }
}

// Admin Authentication Functions
function handleLogin() {
    if (!app) return;
    
    const password = document.getElementById('adminPassword')?.value;
    if (!password) {
        app.showMessage('Please enter the admin password', 'warning');
        return;
    }
    
    // Always verify against database (no hardcoded fallback)
    verifyPasswordWithServer(password);
    
    // Clear password field
    if (document.getElementById('adminPassword')) {
        document.getElementById('adminPassword').value = '';
    }
}

// Verify password with server
async function verifyPasswordWithServer(password) {
    try {
        const response = await fetch('api/verify_password.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                password: password
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            loginSuccess();
        } else {
            app.showMessage('Invalid admin password!', 'error');
        }
    } catch (error) {
        console.error('Error verifying password:', error);
        app.showMessage('Error connecting to server. Please check your connection.', 'error');
    }
}

// Handle successful login
function loginSuccess() {
    app.isAdminLoggedIn = true;
    sessionStorage.setItem('adminLoggedIn', 'true');
    app.updateLoginState();
    app.showMessage('Admin login successful!', 'success');
}

function handleLogout() {
    if (!app) return;
    
    app.isAdminLoggedIn = false;
    sessionStorage.removeItem('adminLoggedIn');
    app.updateLoginState();
    app.showMessage('Logged out successfully', 'info');
}

// Stock Management Functions
function applyFilters() {
    if (app) app.applyFilters();
}

function clearAllFilters() {
    if (app) app.clearAllFilters();
}

function printStock() {
    console.log('Print function called');
    // Check if we're in the View Stock tab
    const viewStockTab = document.getElementById('view-stock');
    const stockReportTab = document.getElementById('stock-report');
    
    if (viewStockTab && viewStockTab.classList.contains('active')) {
        // Print View Stock table data
        if (app && app.currentStock.length > 0) {
            console.log('Printing View Stock data, total rolls:', app.currentStock.length);
            const printContent = generateViewStockPrintHTML(app.currentStock);
            const printWindow = window.open('', '_blank');
            printWindow.document.write(printContent);
            printWindow.document.close();
            printWindow.print();
            app.showMessage('Print dialog opened', 'success');
        } else {
            console.log('No stock data available');
            app.showMessage('No stock data available to print', 'warning');
        }
    } else if (stockReportTab && stockReportTab.classList.contains('active')) {
        // Use Stock Report Manager for report printing
        if (window.stockReportManager) {
            window.stockReportManager.printStock();
        } else {
            console.warn('StockReportManager not initialized');
        }
    } else {
        // Default to View Stock if available
        console.log('Defaulting to View Stock print');
        if (app && app.currentStock.length > 0) {
            const printContent = generateViewStockPrintHTML(app.currentStock);
            const printWindow = window.open('', '_blank');
            printWindow.document.write(printContent);
            printWindow.document.close();
            printWindow.print();
            app.showMessage('Print dialog opened', 'success');
        } else {
            app.showMessage('No stock data available to print', 'warning');
        }
    }
}

function exportToExcel() {
    // Check if we're in the View Stock tab
    const viewStockTab = document.getElementById('view-stock');
    const stockReportTab = document.getElementById('stock-report');
    
    if (viewStockTab && viewStockTab.classList.contains('active')) {
        // Export View Stock table data
        if (app && app.currentStock.length > 0) {
            const csvData = generateViewStockCSV(app.currentStock);
            downloadCSVFile(csvData, `paper_stock_${new Date().toISOString().split('T')[0]}.csv`);
        } else {
            showMessage('No stock data available to export', 'warning');
        }
    } else if (stockReportTab && stockReportTab.classList.contains('active')) {
        // Use Stock Report Manager for report export
        if (window.stockReportManager) {
            window.stockReportManager.exportToExcel();
        } else {
            console.warn('StockReportManager not initialized');
        }
    } else {
        // Default to View Stock if available
        if (app && app.currentStock.length > 0) {
            const csvData = generateViewStockCSV(app.currentStock);
            downloadCSVFile(csvData, `paper_stock_${new Date().toISOString().split('T')[0]}.csv`);
        } else {
            showMessage('No stock data available to export', 'warning');
        }
    }
}

function exportToCSV() {
    if (window.stockReportManager) {
        window.stockReportManager.exportToCSV();
    } else {
        console.warn('StockReportManager not initialized');
    }
}

function sortTable(column) {
    console.log(`sortTable called with column: ${column}`);
    console.log(`app exists: ${!!app}`);
    if (app) {
        console.log(`Calling app.sortStock(${column})`);
        app.sortStock(column);
    } else {
        console.error('App not initialized when sortTable was called');
    }
}

// Additional utility functions
function uploadExcel() {
    if (app) app.uploadExcel();
}

function downloadTemplate() {
    if (app) app.downloadTemplate();
}

function backupDatabase() {
    if (app) app.backupDatabase();
}

function restoreDatabase() {
    if (app) app.restoreDatabase();
}

// Date formatting utility function
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
}

// Show message utility function
function showMessage(message, type) {
    // Create toast notification
    const toast = document.createElement('div');
    toast.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show position-fixed`;
    toast.style.top = '20px';
    toast.style.right = '20px';
    toast.style.zIndex = '9999';
    toast.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    document.body.appendChild(toast);

    // Auto remove after 5 seconds
    setTimeout(() => {
        toast.parentNode.removeChild(toast);
    }, 5000);
}

// Helper functions for View Stock print and export
function generateViewStockPrintHTML(stockData) {
    const tableRows = stockData.map((roll, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${roll.rollnumber}</td>
            <td><span class="badge bg-${getStatusColor(roll.status)}">${roll.status}</span></td>
            <td>${roll.material || '-'}</td>
            <td>${roll.papercompany || '-'}</td>
            <td>${roll.gsm || '-'}</td>
            <td>${roll.width || '-'}</td>
            <td>${roll.length || '-'}</td>
            <td>${roll.squaremeter || '-'}</td>
            <td>${roll.weight || '-'}</td>
            <td>${roll.lotno || '-'}</td>
            <td>${roll.jobname || '-'}</td>
            <td>${roll.jobno || '-'}</td>
            <td>${roll.jobsize || '-'}</td>
            <td>${formatDate(roll.date_added) || '-'}</td>
        </tr>
    `).join('');

    return `
        <html>
            <head>
                <title>Paper Stock Report</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #ddd; padding: 6px; text-align: left; }
                    th { background-color: #f5f5f5; font-weight: bold; }
                    .badge { padding: 2px 6px; border-radius: 3px; color: white; }
                    .bg-success { background-color: #28a745; }
                    .bg-info { background-color: #17a2b8; }
                    .bg-warning { background-color: #ffc107; color: black; }
                    .bg-danger { background-color: #dc3545; }
                    @media print {
                        body { margin: 0; }
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>Paper Stock Management Report</h1>
                    <p>Generated on: ${new Date().toLocaleString()}</p>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Sl. No.</th>
                            <th>Roll Number</th>
                            <th>Status</th>
                            <th>Material</th>
                            <th>Paper Company</th>
                            <th>GSM</th>
                            <th>Width (mm)</th>
                            <th>Length (m)</th>
                            <th>Square Meter</th>
                            <th>Weight (kg)</th>
                            <th>Lot No</th>
                            <th>Job Name</th>
                            <th>Job No</th>
                            <th>Job Size</th>
                            <th>Date Added</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows}
                    </tbody>
                </table>
            </body>
        </html>
    `;
}

function generateViewStockCSV(stockData) {
    const headers = [
        'Sl. No', 'Roll Number', 'Status', 'Material', 'Paper Company', 'GSM', 
        'Width (mm)', 'Length (m)', 'Square Meter', 'Weight (kg)', 'Lot No', 
        'Job Name', 'Job No', 'Job Size', 'Date Added'
    ];

    const csvRows = [headers.join(',')];

    stockData.forEach((roll, index) => {
        const row = [
            index + 1,
            roll.rollnumber || '',
            roll.status || '',
            roll.material || '',
            roll.papercompany || '',
            roll.gsm || '',
            roll.width || '',
            roll.length || '',
            roll.squaremeter || '',
            roll.weight || '',
            roll.lotno || '',
            roll.jobname || '',
            roll.jobno || '',
            roll.jobsize || '',
            formatDate(roll.date_added) || ''
        ];
        // Escape commas and quotes in CSV
        const escapedRow = row.map(field => {
            if (typeof field === 'string' && (field.includes(',') || field.includes('"'))) {
                return `"${field.replace(/"/g, '""')}"`;
            }
            return field;
        });
        csvRows.push(escapedRow.join(','));
    });

    return csvRows.join('\n');
}

function downloadCSVFile(csvData, filename) {
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showMessage('Stock data exported successfully', 'success');
    }
}

function getStatusColor(status) {
    switch (status?.toLowerCase()) {
        case 'stock': return 'success';
        case 'printing': return 'info';
        case 'used': return 'danger';
        default: return 'warning';
    }
}

// Global functions for settings page

// Refresh database statistics
async function refreshDatabaseStats() {
    try {
        showMessage('Refreshing database statistics...', 'info');
        
        if (app && app.currentStock) {
            const totalRolls = app.currentStock.length;
            const stockRolls = app.currentStock.filter(roll => roll.status.toLowerCase() === 'stock').length;
            const printingRolls = app.currentStock.filter(roll => roll.status.toLowerCase() === 'printing').length;
            const usedRolls = app.currentStock.filter(roll => roll.status.toLowerCase() === 'used').length;
            
            // Update the display
            const totalElement = document.getElementById('totalRollsCount');
            const stockElement = document.getElementById('stockRollsCount');
            const printingElement = document.getElementById('printingRollsCount');
            const usedElement = document.getElementById('usedRollsCount');
            
            if (totalElement) totalElement.textContent = totalRolls;
            if (stockElement) stockElement.textContent = stockRolls;
            if (printingElement) printingElement.textContent = printingRolls;
            if (usedElement) usedElement.textContent = usedRolls;
            
            showMessage('Statistics refreshed successfully', 'success');
        } else {
            showMessage('No data available to display statistics', 'warning');
        }
    } catch (error) {
        console.error('Error refreshing stats:', error);
        showMessage('Error refreshing statistics', 'error');
    }
}

// Test database connection
async function testDatabaseConnection() {
    try {
        showMessage('Testing database connection...', 'info');
        
        const response = await fetch('api/get_rolls.php', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                showMessage('Database connection successful', 'success');
            } else {
                showMessage('Database connection failed: ' + (result.message || 'Unknown error'), 'error');
            }
        } else {
            showMessage('Database connection failed: HTTP ' + response.status, 'error');
        }
    } catch (error) {
        console.error('Error testing connection:', error);
        showMessage('Database connection test failed: ' + error.message, 'error');
    }
}

// Initialize database statistics when settings tab is opened
function initializeDatabaseStats() {
    console.log('Initializing database statistics...');
    
    // Force the settings pane to be fully visible first
    const settingsPane = document.getElementById('settings');
    if (settingsPane) {
        settingsPane.style.display = 'block';
        settingsPane.style.visibility = 'visible';
        settingsPane.style.opacity = '1';
        
        // Force add the Bootstrap classes
        if (!settingsPane.classList.contains('show')) {
            settingsPane.classList.add('show');
        }
        if (!settingsPane.classList.contains('active')) {
            settingsPane.classList.add('active');
        }
        
        // Ensure all input fields in settings have dark text for visibility
        settingsPane.querySelectorAll('input, select, textarea').forEach(input => {
            input.classList.add('text-dark');
        });
        
        // Ensure all labels are dark text as well
        settingsPane.querySelectorAll('label').forEach(label => {
            label.classList.add('text-dark');
        });
    }
    
    // Load system information dynamically
    loadSystemInformation();
    
    // Auto-refresh stats when settings page loads
    setTimeout(() => {
        refreshDatabaseStats();
    }, 500);
}

// Function to load system information dynamically
async function loadSystemInformation() {
    try {
        console.log('Loading system information...');
        
        const response = await fetch('api/get_system_info.php', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                // Update system information
                document.getElementById('systemVersion').textContent = data.version || 'Paper Stock Management v1.0';
                document.getElementById('databaseType').textContent = data.database.type || 'MySQL';
                document.getElementById('databaseHost').textContent = data.database.host || 'localhost';
                document.getElementById('databaseName').textContent = data.database.name || 'Unknown';
                document.getElementById('currentAdmin').textContent = data.admin || 'admin';
                document.getElementById('loginStatus').textContent = data.login_status || 'Active';
                
                console.log('System information loaded successfully');
            } else {
                console.error('Failed to load system information:', data.message);
            }
        } else {
            console.error('Error loading system information:', response.status);
        }
    } catch (error) {
        console.error('Error loading system information:', error);
    }
}

// Initialize the application
let app;
let stockReportManager;

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing Paper Stock App...');
    app = new PaperStockApp();
    
    // Add change password modal event listener
    const changePasswordModal = document.getElementById('changePasswordModal');
    if (changePasswordModal) {
        changePasswordModal.addEventListener('shown.bs.modal', function() {
            console.log('Change password modal shown, setting up form...');
            
            // Clear form
            const form = document.getElementById('changePasswordForm');
            if (form) {
                form.reset();
            }
            
            // Clear messages
            const messageDiv = document.getElementById('passwordChangeMessage');
            if (messageDiv) {
                messageDiv.classList.add('d-none');
            }
            
            // Focus on first field
            setTimeout(() => {
                const currentPasswordField = document.getElementById('currentPassword');
                if (currentPasswordField) {
                    currentPasswordField.focus();
                    console.log('Focused on current password field');
                }
            }, 100);        });
    }
    
    // Stock Report Manager Class
    class StockReportManager {
        constructor() {
            this.currentData = [];
            this.reportType = 'overview';
            this.init();
        }

        // Initialize report functionality
        init() {
            this.setupEventListeners();
        }

        setupEventListeners() {
            // Print functionality
            const printStockBtn = document.getElementById('printStockBtn');
            if (printStockBtn) {
                printStockBtn.addEventListener('click', () => {
                    this.printStock();
                });
            }

            const printReportBtn = document.getElementById('printReportBtn');
            if (printReportBtn) {
                printReportBtn.addEventListener('click', () => {
                    this.printCurrentReport();
                });
            }

            // Export functionality
            const exportExcelBtn = document.getElementById('exportExcelBtn');
            if (exportExcelBtn) {
                exportExcelBtn.addEventListener('click', () => {
                    this.exportToExcel();
                });
            }

            const exportCSVBtn = document.getElementById('exportCSVBtn');
            if (exportCSVBtn) {
                exportCSVBtn.addEventListener('click', () => {
                    this.exportToCSV();
                });
            }

            // Report generation
            const generateReportBtn = document.getElementById('generateReportBtn');
            if (generateReportBtn) {
                generateReportBtn.addEventListener('click', () => {
                    this.generateReport();
                });
            }            // Report type change
            const reportType = document.getElementById('reportType');
            if (reportType) {
                reportType.addEventListener('change', (e) => {
                    this.reportType = e.target.value;
                    this.generateReport();
                });
            }

            // Filter changes
            const reportMaterialFilter = document.getElementById('reportMaterialFilter');
            if (reportMaterialFilter) {
                reportMaterialFilter.addEventListener('change', () => {
                    this.generateReport();
                });
            }

            const reportCompanyFilter = document.getElementById('reportCompanyFilter');
            if (reportCompanyFilter) {
                reportCompanyFilter.addEventListener('change', () => {
                    this.generateReport();
                });
            }

            const reportStatusFilter = document.getElementById('reportStatusFilter');
            if (reportStatusFilter) {
                reportStatusFilter.addEventListener('change', () => {
                    this.generateReport();
                });
            }

            const fromDate = document.getElementById('fromDate');
            if (fromDate) {
                fromDate.addEventListener('change', () => {
                    this.generateReport();
                });
            }            const toDate = document.getElementById('toDate');
            if (toDate) {
                toDate.addEventListener('change', () => {
                    this.generateReport();
                });
            }            const quickDateSelect = document.getElementById('quickDateSelect');
            if (quickDateSelect) {
                quickDateSelect.addEventListener('change', () => {
                    this.setQuickDate();
                });
            }

            // Clear filters functionality
            const clearFiltersBtn = document.getElementById('clearFiltersBtn');
            if (clearFiltersBtn) {
                clearFiltersBtn.addEventListener('click', () => {
                    this.clearFilters();
                });
            }
        }

        // Print current stock
        printStock() {
            const printContent = document.getElementById('stockTableContainer')?.innerHTML;
            if (!printContent) {
                if (window.showMessage) {
                    showMessage('No stock data to print', 'warning');
                }
                return;
            }

            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
                <html>
                    <head>
                        <title>Paper Stock Report</title>
                        <style>
                            body { font-family: Arial, sans-serif; margin: 20px; }
                            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                            th { background-color: #f5f5f5; font-weight: bold; }
                            .header { text-align: center; margin-bottom: 20px; }
                            @media print {
                                body { margin: 0; }
                            }
                        </style>
                    </head>
                    <body>
                        <div class="header">
                            <h1>Paper Stock Management Report</h1>
                            <p>Generated on: ${new Date().toLocaleString()}</p>
                        </div>
                        ${printContent}
                    </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.print();
        }

        // Print current report
        printCurrentReport() {
            const reportContent = document.getElementById('stockReportContent')?.innerHTML;
            if (!reportContent) {
                if (window.showMessage) {
                    showMessage('No report to print. Generate a report first.', 'warning');
                }
                return;
            }

            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
                <html>
                    <head>
                        <title>Paper Stock Report</title>
                        <style>
                            body { font-family: Arial, sans-serif; margin: 20px; }
                            .card { border: 1px solid #ddd; margin-bottom: 15px; padding: 15px; }
                            .card-header { background-color: #f5f5f5; font-weight: bold; margin-bottom: 10px; }
                            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                            th { background-color: #f5f5f5; }
                            @media print {
                                body { margin: 0; }
                            }
                        </style>
                    </head>
                    <body>
                        ${reportContent}
                    </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.print();
        }        // Generate report
        async generateReport() {
            try {
                // Show/hide date range filter based on report type
                const dateRangeFilter = document.getElementById('dateRangeFilter');
                const showDateRange = this.reportType === 'date';
                if (dateRangeFilter) {
                    dateRangeFilter.style.display = showDateRange ? 'flex' : 'none';
                }
                
                const response = await fetch('api/get_rolls.php');
                const data = await response.json();
                
                if (data.success) {
                    let filteredData = data.rolls;
                    
                    // Apply filters
                    filteredData = this.applyFilters(filteredData);
                    
                    this.currentData = filteredData;
                    this.displayReport(this.reportType, filteredData);
                    if (window.showMessage) {
                        showMessage('Report generated successfully', 'success');
                    }
                } else {
                    if (window.showMessage) {
                        showMessage('Error loading data for report', 'error');
                    }
                }
            } catch (error) {
                console.error('Error generating report:', error);
                if (window.showMessage) {
                    showMessage('Error generating report', 'error');
                }
            }
        }

        // Apply filters to data
        applyFilters(data) {
            let filteredData = [...data];
            
            // Material filter
            const materialFilter = document.getElementById('reportMaterialFilter')?.value;
            if (materialFilter) {
                filteredData = filteredData.filter(roll => roll.material === materialFilter);
            }
            
            // Company filter
            const companyFilter = document.getElementById('reportCompanyFilter')?.value;
            if (companyFilter) {
                filteredData = filteredData.filter(roll => roll.papercompany === companyFilter);
            }
            
            // Status filter
            const statusFilter = document.getElementById('reportStatusFilter')?.value;
            if (statusFilter) {
                filteredData = filteredData.filter(roll => roll.status === statusFilter);
            }
            
            // Date range filter
            const reportType = document.getElementById('reportType')?.value;
            const fromDate = document.getElementById('fromDate')?.value;
            const toDate = document.getElementById('toDate')?.value;
            
            if (reportType === 'date' && fromDate && toDate) {
                const startDate = new Date(fromDate);
                const endDate = new Date(toDate);
                endDate.setHours(23, 59, 59, 999); // Include the entire end date
                
                filteredData = filteredData.filter(roll => {
                    if (!roll.date_added) return false;
                    const rollDate = new Date(roll.date_added);
                    return rollDate >= startDate && rollDate <= endDate;
                });
            }
            
            return filteredData;
        }        // Display report
        displayReport(reportType, data) {
            const container = document.getElementById('stockReportContent');
            if (!container) return;

            let reportHTML = '';
            
            switch (reportType) {
                case 'overview':
                    reportHTML = this.generateOverviewReport(data);
                    break;
                case 'material':
                    reportHTML = this.generateMaterialReport(data);
                    break;
                case 'company':
                    reportHTML = this.generateCompanyReport(data);
                    break;
                case 'status':
                    reportHTML = this.generateStatusReport(data);
                    break;
                case 'date':
                    reportHTML = this.generateDetailedReport(data);
                    break;
                case 'detailed':
                    reportHTML = this.generateDetailedReport(data);
                    break;
                default:
                    reportHTML = this.generateOverviewReport(data);
            }

            container.innerHTML = reportHTML;
        }

        // Generate overview report
        generateOverviewReport(data) {
            const totalRolls = data.length;
            const mainRolls = data.filter(r => r.rolltype === 'Main Roll').length;
            const slitRolls = data.filter(r => r.rolltype === 'Slit Roll').length;
            const stockRolls = data.filter(r => r.status === 'Stock').length;
            const jobRolls = data.filter(r => r.status === 'Job').length;
            
            const totalSquareMeter = data.reduce((sum, r) => sum + parseFloat(r.squaremeter || 0), 0);
            const totalWeight = data.reduce((sum, r) => sum + parseFloat(r.weight || 0), 0);

            const materials = [...new Set(data.map(r => r.material))].filter(Boolean);
            const companies = [...new Set(data.map(r => r.papercompany))].filter(Boolean);

            return `
                <div class="report-header text-center mb-4">
                    <h2>Paper Stock Overview Report</h2>
                    <p class="text-muted">Generated on ${new Date().toLocaleDateString()}</p>
                </div>

                <div class="row mb-4">
                    <div class="col-md-3">
                        <div class="card text-center">
                            <div class="card-body">
                                <h3 class="text-primary">${totalRolls}</h3>
                                <p class="card-text">Total Rolls</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="card text-center">
                            <div class="card-body">
                                <h3 class="text-success">${stockRolls}</h3>
                                <p class="card-text">In Stock</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="card text-center">
                            <div class="card-body">
                                <h3 class="text-info">${totalSquareMeter.toFixed(2)}</h3>
                                <p class="card-text">Total Sq.M</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="card text-center">
                            <div class="card-body">
                                <h3 class="text-warning">${totalWeight.toFixed(2)}</h3>
                                <p class="card-text">Total Weight (kg)</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="row">
                    <div class="col-md-6">
                        <h4>Roll Types</h4>
                        <ul class="list-group">
                            <li class="list-group-item d-flex justify-content-between">
                                <span>Main Rolls</span>
                                <span class="badge bg-primary rounded-pill">${mainRolls}</span>
                            </li>
                            <li class="list-group-item d-flex justify-content-between">
                                <span>Slit Rolls</span>
                                <span class="badge bg-secondary rounded-pill">${slitRolls}</span>
                            </li>
                        </ul>
                    </div>
                    <div class="col-md-6">
                        <h4>Status Distribution</h4>
                        <ul class="list-group">
                            <li class="list-group-item d-flex justify-content-between">
                                <span>Stock</span>
                                <span class="badge bg-success rounded-pill">${stockRolls}</span>
                            </li>
                            <li class="list-group-item d-flex justify-content-between">
                                <span>Job</span>
                                <span class="badge bg-info rounded-pill">${jobRolls}</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div class="row mt-4">
                    <div class="col-md-6">
                        <h4>Materials (${materials.length})</h4>
                        <div class="list-group">
                            ${materials.map(material => {
                                const count = data.filter(r => r.material === material).length;
                                return `<div class="list-group-item d-flex justify-content-between">
                                    <span>${material}</span>
                                    <span class="badge bg-primary rounded-pill">${count}</span>
                                </div>`;
                            }).join('')}
                        </div>
                    </div>
                    <div class="col-md-6">
                        <h4>Companies (${companies.length})</h4>
                        <div class="list-group">
                            ${companies.map(company => {
                                const count = data.filter(r => r.papercompany === company).length;
                                return `<div class="list-group-item d-flex justify-content-between">
                                    <span>${company}</span>
                                    <span class="badge bg-primary rounded-pill">${count}</span>
                                </div>`;
                            }).join('')}
                        </div>
                    </div>
                </div>
            `;
        }

        // Generate material-wise report
        generateMaterialReport(data) {
            const materials = [...new Set(data.map(r => r.material))].filter(Boolean);
            
            return `
                <div class="report-header text-center mb-4">
                    <h2>Material-wise Stock Report</h2>
                    <p class="text-muted">Generated on ${new Date().toLocaleDateString()}</p>
                </div>

                ${materials.map(material => {
                    const materialRolls = data.filter(r => r.material === material);
                    const totalRolls = materialRolls.length;
                    const stockRolls = materialRolls.filter(r => r.status === 'Stock').length;
                    const totalSqM = materialRolls.reduce((sum, r) => sum + parseFloat(r.squaremeter || 0), 0);
                    
                    return `
                        <div class="card mb-3">
                            <div class="card-header">
                                <h4>${material}</h4>
                            </div>
                            <div class="card-body">
                                <div class="row">
                                    <div class="col-md-4">
                                        <p><strong>Total Rolls:</strong> ${totalRolls}</p>
                                        <p><strong>In Stock:</strong> ${stockRolls}</p>
                                    </div>
                                    <div class="col-md-4">
                                        <p><strong>Total Sq.M:</strong> ${totalSqM.toFixed(2)}</p>
                                    </div>
                                    <div class="col-md-4">
                                        <p><strong>Companies:</strong> ${[...new Set(materialRolls.map(r => r.papercompany))].filter(Boolean).join(', ')}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            `;
        }

        // Generate company-wise report
        generateCompanyReport(data) {
            const companies = [...new Set(data.map(r => r.papercompany))].filter(Boolean);
            
            return `
                <div class="report-header text-center mb-4">
                    <h2>Company-wise Stock Report</h2>
                    <p class="text-muted">Generated on ${new Date().toLocaleDateString()}</p>
                </div>

                ${companies.map(company => {
                    const companyRolls = data.filter(r => r.papercompany === company);
                    const totalRolls = companyRolls.length;
                    const stockRolls = companyRolls.filter(r => r.status === 'Stock').length;
                    const totalSqM = companyRolls.reduce((sum, r) => sum + parseFloat(r.squaremeter || 0), 0);
                    
                    return `
                        <div class="card mb-3">
                            <div class="card-header">
                                <h4>${company}</h4>
                            </div>
                            <div class="card-body">
                                <div class="row">
                                    <div class="col-md-4">
                                        <p><strong>Total Rolls:</strong> ${totalRolls}</p>
                                        <p><strong>In Stock:</strong> ${stockRolls}</p>
                                    </div>
                                    <div class="col-md-4">
                                        <p><strong>Total Sq.M:</strong> ${totalSqM.toFixed(2)}</p>
                                    </div>
                                    <div class="col-md-4">
                                        <p><strong>Materials:</strong> ${[...new Set(companyRolls.map(r => r.material))].filter(Boolean).join(', ')}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            `;
        }

        // Generate status-wise report
        generateStatusReport(data) {
            const statuses = [...new Set(data.map(r => r.status))].filter(Boolean);
            
            return `
                <div class="report-header text-center mb-4">
                    <h2>Status-wise Stock Report</h2>
                    <p class="text-muted">Generated on ${new Date().toLocaleDateString()}</p>
                </div>

                ${statuses.map(status => {
                    const statusRolls = data.filter(r => r.status === status);
                    const totalRolls = statusRolls.length;
                    const totalSqM = statusRolls.reduce((sum, r) => sum + parseFloat(r.squaremeter || 0), 0);
                    
                    return `
                        <div class="card mb-3">
                            <div class="card-header">
                                <h4>${status}</h4>
                            </div>
                            <div class="card-body">
                                <div class="row">
                                    <div class="col-md-6">
                                        <p><strong>Total Rolls:</strong> ${totalRolls}</p>
                                        <p><strong>Total Sq.M:</strong> ${totalSqM.toFixed(2)}</p>
                                    </div>
                                    <div class="col-md-6">
                                        <p><strong>Materials:</strong> ${[...new Set(statusRolls.map(r => r.material))].filter(Boolean).join(', ')}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            `;
        }

        // Generate detailed report
        generateDetailedReport(data) {
            return `
                <div class="report-header text-center mb-4">
                    <h2>Detailed Stock Report</h2>
                    <p class="text-muted">Generated on ${new Date().toLocaleDateString()}</p>
                </div>

                <div class="table-responsive">
                    <table class="table table-striped table-hover">
                        <thead class="table-dark">
                            <tr>
                                <th>Roll Number</th>
                                <th>Material</th>
                                <th>Company</th>
                                <th>GSM</th>
                                <th>Width</th>
                                <th>Length</th>
                                <th>Sq.M</th>
                                <th>Status</th>
                                <th>Type</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${data.map(roll => `
                                <tr>
                                    <td>${roll.rollnumber}</td>
                                    <td>${roll.material || '-'}</td>
                                    <td>${roll.papercompany || '-'}</td>
                                    <td>${roll.gsm || '-'}</td>
                                    <td>${roll.width || '-'}</td>
                                    <td>${roll.length || '-'}</td>
                                    <td>${roll.squaremeter || '-'}</td>
                                    <td><span class="badge bg-${roll.status === 'Stock' ? 'success' : 'info'}">${roll.status}</span></td>
                                    <td>${roll.rolltype}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        }

        // Export to Excel
        exportToExcel() {
            if (this.currentData.length === 0) {
                if (window.showMessage) {
                    showMessage('No data to export. Generate a report first.', 'warning');
                }
                return;
            }

            const csvData = this.convertToCSV(this.currentData);
            this.downloadCSV(csvData, `paper_stock_report_${new Date().toISOString().split('T')[0]}.csv`);
        }

        // Export to CSV
        exportToCSV() {
            if (this.currentData.length === 0) {
                if (window.showMessage) {
                    showMessage('No data to export. Generate a report first.', 'warning');
                }
                return;
            }

            const csvData = this.convertToCSV(this.currentData);
            this.downloadCSV(csvData, `paper_stock_${new Date().toISOString().split('T')[0]}.csv`);
        }

        // Convert data to CSV format
        convertToCSV(data) {
            const headers = [
                'Roll Number', 'Material', 'Paper Company', 'GSM', 'Width', 'Length', 
                'Weight', 'Lot No', 'Square Meter', 'Roll Type', 'Status', 'Date Added'
            ];

            const csvRows = [headers.join(',')];

            data.forEach(roll => {
                const row = [
                    roll.rollnumber || '',
                    roll.material || '',
                    roll.papercompany || '',
                    roll.gsm || '',
                    roll.width || '',
                    roll.length || '',
                    roll.weight || '',
                    roll.lotno || '',
                    roll.squaremeter || '',
                    roll.rolltype || '',
                    roll.status || '',
                    (roll.date_added ? new Date(roll.date_added).toLocaleDateString() : '') || ''
                ];
                csvRows.push(row.join(','));
            });

            return csvRows.join('\n');
        }        // Download CSV file
        downloadCSV(csv, filename) {
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            
            if (link.download !== undefined) {
                const url = URL.createObjectURL(blob);
                link.setAttribute('href', url);
                link.setAttribute('download', filename);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        }

        // Set quick date ranges
        setQuickDate() {
            const quickDateSelect = document.getElementById('quickDateSelect');
            if (!quickDateSelect) return;
            
            const value = quickDateSelect.value;
            if (!value) return;
            
            const today = new Date();
            let startDate = new Date();
            let endDate = new Date();
            
            switch (value) {
                case 'today':
                    startDate = new Date(today);
                    endDate = new Date(today);
                    break;
                case 'week':
                    startDate = new Date(today);
                    startDate.setDate(today.getDate() - today.getDay() + 1);
                    endDate = new Date(today);
                    break;
                case 'month':
                    startDate = new Date(today.getFullYear(), today.getMonth(), 1);
                    endDate = new Date(today);
                    break;
                case 'year':
                    startDate = new Date(today.getFullYear(), 0, 1);
                    endDate = new Date(today);
                    break;
                default:
                    return;
            }
            
            // Set the date inputs
            const fromDate = document.getElementById('fromDate');
            const toDate = document.getElementById('toDate');
            
            if (fromDate) fromDate.value = startDate.toISOString().split('T')[0];
            if (toDate) toDate.value = endDate.toISOString().split('T')[0];
            
            // Show date range filter
            const dateRangeFilter = document.getElementById('dateRangeFilter');
            if (dateRangeFilter) {
                dateRangeFilter.style.display = 'flex';
            }
              // Generate report with new date range
            this.generateReport();
        }

        // Clear all filters
        clearFilters() {
            // Reset all filter dropdowns
            const reportType = document.getElementById('reportType');
            const reportMaterialFilter = document.getElementById('reportMaterialFilter');
            const reportCompanyFilter = document.getElementById('reportCompanyFilter');
            const reportStatusFilter = document.getElementById('reportStatusFilter');
            const fromDate = document.getElementById('fromDate');
            const toDate = document.getElementById('toDate');
            const quickDateSelect = document.getElementById('quickDateSelect');

            if (reportType) reportType.value = 'overview';
            if (reportMaterialFilter) reportMaterialFilter.value = '';
            if (reportCompanyFilter) reportCompanyFilter.value = '';
            if (reportStatusFilter) reportStatusFilter.value = '';
            if (fromDate) fromDate.value = '';
            if (toDate) toDate.value = '';
            if (quickDateSelect) quickDateSelect.value = '';

            // Hide date range filter
            const dateRangeFilter = document.getElementById('dateRangeFilter');
            if (dateRangeFilter) {
                dateRangeFilter.style.display = 'none';
            }

            // Reset report type property
            this.reportType = 'overview';

            // Clear report content
            const stockReportContent = document.getElementById('stockReportContent');
            if (stockReportContent) {
                stockReportContent.innerHTML = '<div class="alert alert-info">Select filters and click "Generate Report" to view stock data.</div>';
            }

            // Show success message
            if (window.showMessage) {
                showMessage('All filters cleared successfully', 'success');
            }
        }
    }
      // Initialize Stock Report Manager
    stockReportManager = new StockReportManager();
    window.stockReportManager = stockReportManager; // Make globally accessible
    
    // Settings tab specific initialization
    const settingsTab = document.getElementById('settings-tab');
    if (settingsTab) {
        settingsTab.addEventListener('shown.bs.tab', function() {
            console.log('Settings tab activated');
            initializeDatabaseStats();
        });
    }
      console.log('Paper Stock Management System initialized successfully');
});

// Debug function to test password field accessibility - call this in browser console
function debugPasswordFields() {
    console.log('=== PASSWORD FIELD DEBUG TEST ===');
    
    const currentPasswordElement = document.getElementById('currentPassword');
    const newPasswordElement = document.getElementById('newPassword');
    const confirmPasswordElement = document.getElementById('confirmPassword');
    
    console.log('Elements found:', {
        currentPassword: !!currentPasswordElement,
        newPassword: !!newPasswordElement,
        confirmPassword: !!confirmPasswordElement
    });
    
    if (currentPasswordElement) {
        console.log('Current Password Field:', {
            value: currentPasswordElement.value,
            valueLength: currentPasswordElement.value.length,
            disabled: currentPasswordElement.disabled,
            readOnly: currentPasswordElement.readOnly,
            type: currentPasswordElement.type,
            style: {
                display: currentPasswordElement.style.display,
                visibility: currentPasswordElement.style.visibility,
                pointerEvents: currentPasswordElement.style.pointerEvents
            }
        });
    }
    
    console.log('=== END DEBUG TEST ===');
}

// Make debug function globally available
window.debugPasswordFields = debugPasswordFields;

// Function to navigate to Multi Slit tab and pre-select roll
function goToSlitTab(rollNumber) {
    try {
        // Switch to Multi Slit tab
        const multiSlitTab = document.getElementById('multi-slit-tab');
        if (multiSlitTab) {
            // Use Bootstrap Tab to switch
            const bsTab = new bootstrap.Tab(multiSlitTab);
            bsTab.show();
            
            // Wait a moment for tab to load, then pre-select the roll
            setTimeout(() => {
                const rollSelect = document.getElementById('multiSlitRollSelect');
                if (rollSelect) {
                    rollSelect.value = rollNumber;
                    // Trigger the change event to show slit inputs
                    if (typeof handleMultiSlitRollSelection === 'function') {
                        handleMultiSlitRollSelection();
                    }
                }
            }, 100);
        }
    } catch (error) {
        console.error('Error navigating to slit tab:', error);
    }
}

// Multi-slit functionality functions
function handleMultiSlitRollSelection() {
    const selectedRoll = document.getElementById('multiSlitRollSelect').value;
    const container = document.getElementById('multiSlitInputs');
    const header = document.getElementById('slitInputsHeader');

    if (selectedRoll && typeof app !== 'undefined' && app.currentStock) {
        const roll = app.currentStock.find(r => r.rollnumber === selectedRoll);
        if (roll) {
            displayOriginalRollDetails(roll);
            setupSlitInputs(roll);
            container.classList.remove('d-none');
            // Make sure remaining dimensions are displayed
            calculateRemainingDimensions();
        }
    } else {
        container.classList.add('d-none');
        if (header) {
            header.classList.add('d-none');
        }
        // Clear remaining dimensions display
        const remainingDisplay = document.getElementById('remainingDimensions');
        if (remainingDisplay) {
            remainingDisplay.innerHTML = '';
        }
    }
}

function displayOriginalRollDetails(roll) {
    const detailsDiv = document.getElementById('originalRollDetails');
    if (detailsDiv) {
        detailsDiv.innerHTML = `
            <p><strong>Roll Number:</strong> ${roll.rollnumber}</p>
            <p><strong>Material:</strong> ${roll.material}</p>
            <p><strong>Company:</strong> ${roll.papercompany}</p>
            <p><strong>GSM:</strong> ${roll.gsm}</p>
            <p><strong>Dimensions:</strong> ${roll.width}mm x ${roll.length}m</p>
            <p><strong>Weight:</strong> ${roll.weight} kg</p>
        `;
    }
}

function setupSlitInputs(roll) {
    const container = document.getElementById('slitInputsContainer');
    if (container) {
        container.innerHTML = ''; // Clear existing inputs
        addSlitInput(roll); // Add first slit input
    }
    // Calculate remaining dimensions after first slit is added
    calculateRemainingDimensions();
}

function addSlitInput(roll = null) {
    const container = document.getElementById('slitInputsContainer');
    if (!container) return;
    
    const inputCount = container.children.length + 1;
    const suffix = String.fromCharCode(64 + inputCount); // A, B, C, etc.
      // Get original roll dimensions and calculate remaining dimensions
    let defaultWidth = '';
    let defaultLength = '';
    let originalRoll = null;
    
    if (roll) {
        originalRoll = roll;
        defaultLength = roll.length;
    } else {
        // If roll is not passed, try to get it from the selected roll
        const selectedRollNumber = document.getElementById('multiSlitRollSelect')?.value;
        if (selectedRollNumber && typeof app !== 'undefined' && app.currentStock) {
            originalRoll = app.currentStock.find(r => r.rollnumber === selectedRollNumber);
            if (originalRoll) {
                defaultLength = originalRoll.length;
            }
        }
    }    // Calculate width based on whether this is first slit or subsequent slit
    if (originalRoll) {
        if (container.children.length === 0) {
            // First slit: pre-fill with original roll width (like edit modal)
            defaultWidth = originalRoll.width;
        } else {
            // Subsequent slits: use remaining width
            const remainingDims = calculateRemainingDimensionsForNewSlit(originalRoll);
            defaultWidth = remainingDims.width > 0 ? remainingDims.width : '';
            defaultLength = remainingDims.length > 0 ? remainingDims.length : defaultLength;
        }
    }
    
    const inputRow = document.createElement('div');
    inputRow.className = 'row mb-2 slit-input-group';
    inputRow.innerHTML = `
        <div class="col-md-1">
            <input type="number" class="form-control slit-width" placeholder="Width (mm)" 
                   min="1" step="0.01" value="${defaultWidth}" onchange="calculateRemainingDimensions(); validateDimensions(this)">
        </div>
        <div class="col-md-1">
            <input type="number" class="form-control slit-length" placeholder="Length (m)" 
                   min="1" step="0.01" value="${defaultLength}" onchange="calculateRemainingDimensions(); validateDimensions(this)">
        </div>
        <div class="col-md-1">
            <input type="text" class="form-control slit-suffix" placeholder="Suffix" value="${suffix}" readonly>
        </div>
        <div class="col-md-2">
            <select class="form-control slit-status" onchange="updateSlitStatus(this)">
                <option value="Printing" selected>Printing</option>
                <option value="Stock">Stock</option>
            </select>
        </div>
        <div class="col-md-2">
            <input type="text" class="form-control slit-jobname" placeholder="Job Name (optional)">
        </div>
        <div class="col-md-2">
            <input type="text" class="form-control slit-jobno" placeholder="Job No. (optional)">
        </div>
        <div class="col-md-2">
            <input type="text" class="form-control slit-jobsize" placeholder="Job Size (optional)">
        </div>
        <div class="col-md-1">
            <button type="button" class="btn btn-sm btn-danger" onclick="removeSlitInput(this)">
                Remove
            </button>
        </div>
    `;
    
    container.appendChild(inputRow);
    
    // Update remaining dimensions display
    calculateRemainingDimensions();
}

function removeSlitInput(button) {
    const row = button.closest('.slit-input-group');
    if (row) {
        row.remove();
        calculateRemainingDimensions();
        updateSuffixes();
    }
}

function calculateRemainingDimensionsForNewSlit(originalRoll) {
    const slitInputs = document.querySelectorAll('#slitInputsContainer .slit-input-group');
    let totalUsedWidth = 0;
    let minRemainingLength = parseFloat(originalRoll.length);
    
    slitInputs.forEach(group => {
        const widthInput = group.querySelector('.slit-width');
        const lengthInput = group.querySelector('.slit-length');
        
        const width = parseFloat(widthInput.value) || 0;
        const length = parseFloat(lengthInput.value) || 0;
        
        totalUsedWidth += width;
        if (length > 0) {
            minRemainingLength = Math.min(minRemainingLength, length);
        }
    });
    
    const remainingWidth = parseFloat(originalRoll.width) - totalUsedWidth;
    const remainingLength = minRemainingLength;
    
    return {
        width: Math.max(0, remainingWidth),
        length: Math.max(0, remainingLength)
    };
}

function validateDimensions(input) {
    const selectedRollNumber = document.getElementById('multiSlitRollSelect')?.value;
    if (!selectedRollNumber || typeof app === 'undefined' || !app.currentStock) return;
    
    const originalRoll = app.currentStock.find(r => r.rollnumber === selectedRollNumber);
    if (!originalRoll) return;
    
    const originalWidth = parseFloat(originalRoll.width);
    const originalLength = parseFloat(originalRoll.length);
    
    const inputValue = parseFloat(input.value) || 0;
    const isWidthField = input.classList.contains('slit-width');
    const isLengthField = input.classList.contains('slit-length');
    
    // Remove any previous validation classes
    input.classList.remove('is-invalid', 'border-danger');
    
    // Validate individual field against original dimensions
    if (isWidthField && inputValue > originalWidth) {
        input.classList.add('is-invalid', 'border-danger');
        if (typeof app !== 'undefined') {
            app.showMessage(`Width cannot exceed original roll width (${originalWidth}mm)`, 'error');
        }
        return false;
    }
    
    if (isLengthField && inputValue > originalLength) {
        input.classList.add('is-invalid', 'border-danger');
        if (typeof app !== 'undefined') {
            app.showMessage(`Length cannot exceed original roll length (${originalLength}m)`, 'error');
        }
        return false;
    }
    
    // Check total width usage for width fields
    if (isWidthField) {
        const slitInputs = document.querySelectorAll('#slitInputsContainer .slit-input-group');
        let totalUsedWidth = 0;
        
        slitInputs.forEach(group => {
            const widthInput = group.querySelector('.slit-width');
            const width = parseFloat(widthInput.value) || 0;
            totalUsedWidth += width;
        });
        
        if (totalUsedWidth > originalWidth) {
            input.classList.add('is-invalid', 'border-danger');
            if (typeof app !== 'undefined' && app.showMessage) {
                app.showMessage(`Total slit width (${totalUsedWidth}mm) exceeds original roll width (${originalWidth}mm)`, 'error');
            }
            return false;
        }
    }
    
    return true;
}

function calculateRemainingDimensions() {
    const selectedRoll = document.getElementById('multiSlitRollSelect').value;
    if (!selectedRoll || typeof app === 'undefined' || !app.currentStock) return;
    
    const roll = app.currentStock.find(r => r.rollnumber === selectedRoll);
    if (!roll) return;
    
    const originalWidth = parseFloat(roll.width);
    const originalLength = parseFloat(roll.length);
    
    const slitInputs = document.querySelectorAll('#slitInputsContainer .slit-input-group');
    let totalUsedWidth = 0;
    let minRemainingLength = originalLength;
    
    slitInputs.forEach(group => {
        const widthInput = group.querySelector('.slit-width');
        const lengthInput = group.querySelector('.slit-length');
        
        const width = parseFloat(widthInput.value) || 0;
        const length = parseFloat(lengthInput.value) || 0;
        
        totalUsedWidth += width;
        if (length > 0) {
            minRemainingLength = Math.min(minRemainingLength, length);
        }
    });
    
    const remainingWidth = originalWidth - totalUsedWidth;
    const remainingLength = minRemainingLength;
    
    updateRemainingDisplay(remainingWidth, remainingLength);
}

function updateRemainingDisplay(remainingWidth, remainingLength) {
    // First try the multi-slit element, then fall back to edit modal element
    let display = document.getElementById('remainingDimensions');
    if (!display) {
        display = document.getElementById('remainingDisplay');
    }
    
    if (display) {
        const selectedRollNumber = document.getElementById('multiSlitRollSelect')?.value;
        let nextPartName = '';
        
        // Calculate next part name for remaining roll
        if (selectedRollNumber && remainingWidth > 0) {
            const slitInputs = document.querySelectorAll('#slitInputsContainer .slit-input-group');
            const nextSuffix = String.fromCharCode(65 + slitInputs.length); // Next letter after current slits
            nextPartName = `${selectedRollNumber}-${nextSuffix}`;
        }
        
        const widthClass = remainingWidth <= 0 ? 'text-danger fw-bold' : 
                          (remainingWidth < 50 ? 'text-warning fw-bold' : 'text-dark fw-bold');
        
        display.innerHTML = `
            <div class="alert alert-light border">
                <small>
                    <strong class="text-dark">Remaining Dimensions:</strong><br>
                    <span class="${widthClass}">Width: ${Math.max(0, remainingWidth).toFixed(1)}mm</span> | 
                    <span class="text-dark fw-bold">Length: ${Math.max(0, remainingLength).toFixed(1)}m</span>
                </small>
                ${remainingWidth > 0 && nextPartName ? `
                <div class="mt-2">
                    <small>
                        <strong class="text-info">Remaining part will be:</strong> ${nextPartName}
                    </small>
                </div>` : ''}
            </div>
        `;
        
        // Also apply alert classes for backwards compatibility
        if (remainingWidth < 0) {
            display.className = 'alert alert-danger';
        } else if (remainingWidth < 50) {
            display.className = 'alert alert-warning';
        } else {
            display.className = 'alert alert-info';
        }
    }
}

function updateSuffixes() {
    const container = document.getElementById('slitInputsContainer');
    const slitGroups = container.querySelectorAll('.slit-input-group');
    
    slitGroups.forEach((group, index) => {
        const suffixInput = group.querySelector('.slit-suffix');
        const suffix = String.fromCharCode(65 + index); // A, B, C, etc.
        suffixInput.value = suffix;
    });
}

function filterSlitRolls() {
    const searchTerm = document.getElementById('rollSearchInput').value.toLowerCase();
    const select = document.getElementById('multiSlitRollSelect');

    if (!select || typeof app === 'undefined' || !app.currentStock) return;

    // Clear existing options except first
    select.innerHTML = '<option value="">Select a roll</option>';

    // Filter and populate
    const stockRolls = app.currentStock.filter(roll => 
        roll.status === 'Stock' && 
        (roll.rollnumber.toLowerCase().includes(searchTerm) ||
         roll.material.toLowerCase().includes(searchTerm) ||
         roll.papercompany.toLowerCase().includes(searchTerm))
    );

    stockRolls.forEach(roll => {
        const option = document.createElement('option');
        option.value = roll.rollnumber;
        option.textContent = `${roll.rollnumber} - ${roll.material} - ${roll.papercompany} (${roll.width}mm x ${roll.length}m)`;
        select.appendChild(option);
    });
}

// Process multi-slit operation
async function processMultiSlit() {
    const selectedRollNumber = document.getElementById('multiSlitRollSelect').value;
    if (!selectedRollNumber) {
        if (typeof app !== 'undefined') {
            app.showMessage('Please select a roll to slit', 'error');
        }
        return;
    }

    const slitInputs = document.querySelectorAll('#slitInputsContainer .slit-input-group');
    
    if (slitInputs.length === 0) {
        if (typeof app !== 'undefined') {
            app.showMessage('Please add at least one slit dimension', 'error');
        }
        return;
    }
      // Find the selected roll object to get original dimensions
    const selectedRoll = app.currentStock.find(r => r.rollnumber === selectedRollNumber);
    if (!selectedRoll) {
        if (typeof app !== 'undefined') {
            app.showMessage('Selected roll not found in current stock data', 'error');
        }
        return;
    }

    const originalWidth = parseFloat(selectedRoll.width);
    const originalLength = parseFloat(selectedRoll.length);

    // Validate slit inputs and calculate remaining dimensions
    const slits = [];
    let hasErrors = false;
    let totalUsedWidth = 0;
    
    slitInputs.forEach((group, index) => {
        const widthInput = group.querySelector('.slit-width');
        const lengthInput = group.querySelector('.slit-length');
        const suffixInput = group.querySelector('.slit-suffix');
        const statusInput = group.querySelector('.slit-status');
        const jobNameInput = group.querySelector('.slit-jobname');
        const jobNoInput = group.querySelector('.slit-jobno');
        const jobSizeInput = group.querySelector('.slit-jobsize');

        const width = parseFloat(widthInput.value);
        const length = parseFloat(lengthInput.value);
        const suffix = suffixInput.value.trim();
        const status = statusInput.value;
        const jobName = jobNameInput.value.trim();
        const jobNo = jobNoInput.value.trim();
        const jobSize = jobSizeInput.value.trim();

        if (isNaN(width) || width <= 0) {
            widthInput.classList.add('is-invalid');
            hasErrors = true;
        } else {
            widthInput.classList.remove('is-invalid');
            totalUsedWidth += width;
        }

        if (isNaN(length) || length <= 0) {
            lengthInput.classList.add('is-invalid');
            hasErrors = true;
        } else {
            lengthInput.classList.remove('is-invalid');
        }

        if (!suffix) {
            suffixInput.classList.add('is-invalid');
            hasErrors = true;
        } else {
            suffixInput.classList.remove('is-invalid');
        }

        if (!hasErrors) {
            slits.push({
                width: width,
                length: length,
                suffix: suffix,
                status: status,
                jobName: jobName,
                jobNo: jobNo,
                jobSize: jobSize
            });
        }
    });

    // Calculate remaining width and auto-add remaining roll if needed
    const remainingWidth = originalWidth - totalUsedWidth;
    if (!hasErrors && remainingWidth > 5) { // Only create remaining roll if > 5mm
        // Generate next suffix letter
        const nextSuffixIndex = slits.length;
        const nextSuffix = String.fromCharCode(65 + nextSuffixIndex); // A, B, C, etc.
        
        // Add remaining roll automatically
        slits.push({
            width: remainingWidth,
            length: originalLength,
            suffix: nextSuffix,
            status: 'Stock', // Remaining parts are typically Stock
            jobName: '',
            jobNo: '',
            jobSize: ''
        });
        
        console.log(`Auto-added remaining roll: ${selectedRollNumber}-${nextSuffix} with ${remainingWidth}mm width`);
    }

    if (hasErrors) {
        if (typeof app !== 'undefined') {
            app.showMessage('Please fix the validation errors before proceeding', 'error');
        }
        return;
    }    if (typeof app !== 'undefined') {
        app.showMessage('Processing multi-slit operation...', 'info');
    }

    try {
        const response = await fetch('api/process_slit.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                original_roll_id: selectedRoll.id,
                slits: slits
            })
        });

        const result = await response.json();        if (result.success) {
            if (typeof app !== 'undefined') {
                // Determine message based on remaining roll creation
                let message = `Successfully created ${slits.length} slit rolls from ${selectedRollNumber}`;
                if (result.slit_roll_ids && result.slit_roll_ids.length > slits.length) {
                    const remainingRollCount = result.slit_roll_ids.length - slits.length;
                    message += ` + ${remainingRollCount} remaining roll(s)`;
                }
                
                app.showMessage(message, 'success');
                
                // Clear the form
                document.getElementById('multiSlitRollSelect').value = '';
                document.getElementById('multiSlitInputs').classList.add('d-none');
                document.getElementById('rollSearchInput').value = '';
                
                // Reload stock data first
                app.loadStock();
                  // After a short delay, automatically navigate to View Stock tab to show new rolls
                setTimeout(() => {
                    // Find and click the View Stock tab
                    const viewStockTab = document.querySelector('a[href="#view-stock"]');
                    if (viewStockTab) {
                        viewStockTab.click();
                        
                        // Show additional success message in the View Stock tab
                        setTimeout(() => {
                            app.showMessage(`New slit rolls from ${selectedRollNumber} are now visible in the stock table`, 'info');
                        }, 500);
                    }
                }, 1000);
            }
        } else {
            if (typeof app !== 'undefined') {
                app.showMessage(result.message || 'Failed to process multi-slit operation', 'error');
            }
        }
    } catch (error) {
        console.error('Error processing multi-slit:', error);
        if (typeof app !== 'undefined') {
            app.showMessage('Error processing multi-slit operation', 'error');
        }
    }
}

function updateSlitStatus(selectElement) {
    // This function can be used to update UI based on status selection
    // Currently just for future extensibility
}