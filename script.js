/* ============================================================================
   EXPENSEX – SMART EXPENSE TRACKER
   Tech Stack: HTML5, Tailwind CSS, Vanilla JavaScript, Supabase Auth & PostgreSQL
   ============================================================================ */

/* ============================================================================
   1. SUPABASE CONFIGURATION
   ============================================================================
   INSTRUCTIONS:
   1. Go to https://supabase.com and open your Project Dashboard.
   2. Navigate to Project Settings -> API.
   3. Copy your 'Project URL' and paste it into SUPABASE_URL below.
   4. Copy your 'anon' / 'public' Key and paste it into SUPABASE_ANON_KEY below.
   IMPORTANT: NEVER paste your secret 'service_role' key in frontend code!
   ============================================================================ */

const SUPABASE_URL = "https://noibqchqlpgszpztytoa.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5vaWJxY2hxbHBnc3pwenR5dG9hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg5NjkxNTgsImV4cCI6MjEwNDU0NTE1OH0.XklblGNidz1cs3p8jtTuLj2z3yD1-2T7ohB6D7QSwTs";

// Initialize Supabase Client
let supabase = null;
const isSupabaseConfigured =
    SUPABASE_URL !== "YOUR_SUPABASE_PROJECT_URL" &&
    SUPABASE_ANON_KEY !== "YOUR_SUPABASE_ANON_KEY" &&
    typeof window.supabase !== "undefined";

if (isSupabaseConfigured) {
    try {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
            auth: {
                persistSession: true,
                autoRefreshToken: true,
                detectSessionInUrl: true
            }
        });
    } catch (e) {
        console.error("Failed to initialize Supabase client:", e);
    }
}

/* ============================================================================
   2. GLOBAL STATE & CATEGORIES
   ============================================================================ */

let currentUser = null;
let allTransactions = [];
let pendingDeleteId = null;

// Income Categories
const incomeCategories = [
    "Pocket Money",
    "Salary",
    "Scholarship",
    "Gift",
    "Freelance",
    "Other Income"
];

// Expense Categories - Pocket Money is strictly excluded!
const expenseCategories = [
    "Food",
    "Travel",
    "Shopping",
    "Education",
    "Bills",
    "Other Expense"
];

/* ============================================================================
   3. DOM ELEMENT REFERENCES
   ============================================================================ */

// Auth DOM Elements
const authScreen = document.getElementById("authScreen");
const loginBox = document.getElementById("loginBox");
const registerBox = document.getElementById("registerBox");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const showRegisterBtn = document.getElementById("showRegister");
const showLoginBtn = document.getElementById("showLogin");
const loginError = document.getElementById("loginError");
const loginErrorText = document.getElementById("loginErrorText");
const registerError = document.getElementById("registerError");
const registerErrorText = document.getElementById("registerErrorText");
const loginSubmitBtn = document.getElementById("loginSubmitBtn");
const loginBtnText = document.getElementById("loginBtnText");
const loginSpinner = document.getElementById("loginSpinner");
const registerSubmitBtn = document.getElementById("registerSubmitBtn");
const registerBtnText = document.getElementById("registerBtnText");
const registerSpinner = document.getElementById("registerSpinner");
const logoutBtn = document.getElementById("logoutBtn");
const mobileLogoutBtn = document.getElementById("mobileLogoutBtn");
const userNameDisplay = document.getElementById("userNameDisplay");
const userAvatar = document.getElementById("userAvatar");
const configBanner = document.getElementById("configBanner");

// Dashboard Metric Elements
const balance = document.getElementById("balance");
const balanceStatus = document.getElementById("balanceStatus");
const totalIncome = document.getElementById("totalIncome");
const totalExpense = document.getElementById("totalExpense");
const transactionCount = document.getElementById("transactionCount");
const currentMonthExpense = document.getElementById("currentMonthExpense");
const currentMonthName = document.getElementById("currentMonthName");
const mostUsedCategory = document.getElementById("mostUsedCategory");
const mostUsedCategoryCount = document.getElementById("mostUsedCategoryCount");
const currentDateDisplay = document.getElementById("currentDateDisplay");

// Form Elements
const transactionForm = document.getElementById("transactionForm");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");
const categoryLabel = document.getElementById("categoryLabel");
const descriptionInput = document.getElementById("description");
const dateInput = document.getElementById("date");
const errorMessage = document.getElementById("errorMessage");
const errorMessageText = document.getElementById("errorMessageText");
const addSubmitBtn = document.getElementById("addSubmitBtn");
const addBtnText = document.getElementById("addBtnText");
const addPlusIcon = document.getElementById("addPlusIcon");
const addSpinner = document.getElementById("addSpinner");

// Search & Filter Elements
const searchInput = document.getElementById("search");
const typeFilter = document.getElementById("typeFilter");
const categoryFilter = document.getElementById("categoryFilter");
const monthFilter = document.getElementById("monthFilter");
const resetFiltersBtn = document.getElementById("resetFiltersBtn");
const filteredCountBadge = document.getElementById("filteredCountBadge");

// List & Table Elements
const transactionTable = document.getElementById("transactionTable");
const mobileTransactions = document.getElementById("mobileTransactions");
const emptyMessage = document.getElementById("emptyMessage");
const loadingSkeleton = document.getElementById("loadingSkeleton");
const clearAllBtn = document.getElementById("clearAllBtn");

// Modals
const editModal = document.getElementById("editModal");
const editForm = document.getElementById("editForm");
const editIdInput = document.getElementById("editId");
const editAmountInput = document.getElementById("editAmount");
const editCategoryInput = document.getElementById("editCategory");
const editDescriptionInput = document.getElementById("editDescription");
const editDateInput = document.getElementById("editDate");
const deleteModal = document.getElementById("deleteModal");
const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
const toastContainer = document.getElementById("toastContainer");

/* ============================================================================
   4. TOAST NOTIFICATION SYSTEM
   ============================================================================ */

function showToast(message, type = "success") {
    if (!toastContainer) return;

    const toast = document.createElement("div");
    toast.className = "toast-enter pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl shadow-lg border text-sm font-medium transition-all duration-300";

    if (type === "success") {
        toast.classList.add("bg-emerald-50", "border-emerald-200", "text-emerald-900");
        toast.innerHTML = `
            <svg class="w-5 h-5 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
            <span class="flex-1">${escapeHTML(message)}</span>
        `;
    } else if (type === "error") {
        toast.classList.add("bg-rose-50", "border-rose-200", "text-rose-900");
        toast.innerHTML = `
            <svg class="w-5 h-5 text-rose-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            <span class="flex-1">${escapeHTML(message)}</span>
        `;
    } else {
        toast.classList.add("bg-indigo-50", "border-indigo-200", "text-indigo-900");
        toast.innerHTML = `
            <svg class="w-5 h-5 text-indigo-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            <span class="flex-1">${escapeHTML(message)}</span>
        `;
    }

    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.classList.remove("toast-enter");
        toast.classList.add("toast-exit");
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 260);
    }, 3500);
}

/* ============================================================================
   5. AUTHENTICATION (SUPABASE AUTH)
   ============================================================================ */

// Password visibility helper
function togglePasswordVisibility(inputId, button) {
    const input = document.getElementById(inputId);
    if (!input) return;
    const isPassword = input.type === "password";
    input.type = isPassword ? "text" : "password";
    const icon = button.querySelector(".eye-icon");
    if (icon) {
        if (isPassword) {
            icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"/>';
        } else {
            icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>';
        }
    }
}

// Toggle between Login and Register views
if (showRegisterBtn) {
    showRegisterBtn.addEventListener("click", () => {
        loginBox.classList.add("hidden");
        registerBox.classList.remove("hidden");
        hideAuthErrors();
    });
}

if (showLoginBtn) {
    showLoginBtn.addEventListener("click", () => {
        registerBox.classList.add("hidden");
        loginBox.classList.remove("hidden");
        hideAuthErrors();
    });
}

function showAuthError(element, textEl, message) {
    if (textEl) textEl.textContent = message;
    if (element) element.classList.remove("hidden");
}

function hideAuthErrors() {
    if (loginError) loginError.classList.add("hidden");
    if (registerError) registerError.classList.add("hidden");
}

// Check session on startup
async function checkSession() {
    if (!isSupabaseConfigured) {
        if (configBanner) configBanner.classList.remove("hidden");

        // Local fallback demo session if keys are not set yet
        const demoUser = JSON.parse(localStorage.getItem("expenseXCurrentUser"));
        if (demoUser) {
            currentUser = demoUser;
            onUserLoggedIn(currentUser);
        } else {
            showAuthScreen(true);
        }
        return;
    }

    try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (session && session.user) {
            currentUser = session.user;
            onUserLoggedIn(currentUser);
        } else {
            showAuthScreen(true);
        }
    } catch (err) {
        console.error("Session check error:", err);
        showAuthScreen(true);
    }
}

// Initialize Auth listeners
function initAuth() {
    if (isSupabaseConfigured) {
        supabase.auth.onAuthStateChange((event, session) => {
            if (event === "SIGNED_IN" && session?.user) {
                currentUser = session.user;
                onUserLoggedIn(currentUser);
            } else if (event === "SIGNED_OUT") {
                currentUser = null;
                showAuthScreen(true);
            }
        });
    }
}

function showAuthScreen(show) {
    if (show) {
        authScreen.classList.remove("hidden");
    } else {
        authScreen.classList.add("hidden");
    }
}

function onUserLoggedIn(user) {
    showAuthScreen(false);

    const displayName = user.user_metadata?.name || user.email?.split("@")[0] || "User";
    userNameDisplay.textContent = displayName;
    userAvatar.textContent = displayName.charAt(0).toUpperCase();

    // Load user transactions
    loadTransactions();
}

// Login Handler
if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        hideAuthErrors();

        const email = document.getElementById("loginEmail").value.trim().toLowerCase();
        const password = document.getElementById("loginPassword").value;

        setLoadingState(loginSubmitBtn, loginBtnText, loginSpinner, true, "Signing in...");

        try {
            if (!isSupabaseConfigured) {
                // Demo fallback login
                const users = JSON.parse(localStorage.getItem("expenseXUsers")) || [];
                const matched = users.find(u => u.email === email && u.password === password);
                if (!matched) {
                    throw new Error("Invalid email or password. (Configure Supabase keys in script.js for real cloud auth)");
                }
                currentUser = { id: matched.id, email: matched.email, user_metadata: { name: matched.name } };
                localStorage.setItem("expenseXCurrentUser", JSON.stringify(currentUser));
                onUserLoggedIn(currentUser);
                showToast("Logged in successfully (Demo Mode)", "success");
                loginForm.reset();
                return;
            }

            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) throw error;

            currentUser = data.user;
            loginForm.reset();
            showToast("Login successful! Welcome back.", "success");
            onUserLoggedIn(currentUser);

        } catch (err) {
            showAuthError(loginError, loginErrorText, err.message || "Failed to sign in. Please verify your credentials.");
        } finally {
            setLoadingState(loginSubmitBtn, loginBtnText, loginSpinner, false, "Sign In");
        }
    });
}

// Registration Handler
if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        hideAuthErrors();

        const name = document.getElementById("registerName").value.trim();
        const email = document.getElementById("registerEmail").value.trim().toLowerCase();
        const password = document.getElementById("registerPassword").value;

        if (password.length < 6) {
            showAuthError(registerError, registerErrorText, "Password must be at least 6 characters.");
            return;
        }

        setLoadingState(registerSubmitBtn, registerBtnText, registerSpinner, true, "Creating account...");

        try {
            if (!isSupabaseConfigured) {
                // Demo fallback register
                const users = JSON.parse(localStorage.getItem("expenseXUsers")) || [];
                if (users.some(u => u.email === email)) {
                    throw new Error("Account with this email already exists.");
                }
                const newUser = { id: "user_" + Date.now(), name, email, password };
                users.push(newUser);
                localStorage.setItem("expenseXUsers", JSON.stringify(users));

                currentUser = { id: newUser.id, email: newUser.email, user_metadata: { name: newUser.name } };
                localStorage.setItem("expenseXCurrentUser", JSON.stringify(currentUser));
                onUserLoggedIn(currentUser);
                showToast("Account created successfully (Demo Mode)", "success");
                registerForm.reset();
                return;
            }

            const { data, error } = await supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        name: name
                    }
                }
            });

            if (error) throw error;

            if (data.session) {
                currentUser = data.user;
                showToast("Account created successfully! Welcome to ExpenseX.", "success");
                registerForm.reset();
                onUserLoggedIn(currentUser);
            } else {
                // Supabase email confirmation required
                showToast("Account created! Please check your email to confirm registration.", "info");
                registerBox.classList.add("hidden");
                loginBox.classList.remove("hidden");
                registerForm.reset();
            }

        } catch (err) {
            showAuthError(registerError, registerErrorText, err.message || "Failed to create account.");
        } finally {
            setLoadingState(registerSubmitBtn, registerBtnText, registerSpinner, false, "Sign Up Free");
        }
    });
}

// Logout Handler
async function logoutUser() {
    try {
        if (isSupabaseConfigured && supabase) {
            await supabase.auth.signOut();
        } else {
            localStorage.removeItem("expenseXCurrentUser");
        }
        currentUser = null;
        allTransactions = [];
        renderTransactions([]);
        updateDashboard([]);
        showToast("Logged out successfully.", "info");
        showAuthScreen(true);
    } catch (err) {
        console.error("Logout error:", err);
        showToast("Error during logout.", "error");
    }
}

if (logoutBtn) logoutBtn.addEventListener("click", logoutUser);
if (mobileLogoutBtn) mobileLogoutBtn.addEventListener("click", logoutUser);

function setLoadingState(btn, textEl, spinnerEl, isLoading, text) {
    if (!btn) return;
    btn.disabled = isLoading;
    if (textEl) textEl.textContent = text;
    if (spinnerEl) {
        if (isLoading) spinnerEl.classList.remove("hidden");
        else spinnerEl.classList.add("hidden");
    }
}

/* ============================================================================
   6. DYNAMIC CATEGORY DROPDOWN LOGIC
   ============================================================================ */

function updateCategoryOptions(targetSelect = categoryInput, targetLabel = categoryLabel, isEdit = false) {
    const selector = isEdit ? 'input[name="editType"]:checked' : 'input[name="type"]:checked';
    const checkedRadio = document.querySelector(selector);
    const selectedType = checkedRadio ? checkedRadio.value : "Income";

    const categories = selectedType === "Income" ? incomeCategories : expenseCategories;

    if (targetLabel) {
        targetLabel.textContent = `${selectedType} Category *`;
    }

    targetSelect.innerHTML = `<option value="">Select ${selectedType} Category</option>`;

    categories.forEach(cat => {
        const opt = document.createElement("option");
        opt.value = cat;
        opt.textContent = cat;
        targetSelect.appendChild(opt);
    });
}

// Attach change event listeners to type radio inputs
document.querySelectorAll('input[name="type"]').forEach(radio => {
    radio.addEventListener("change", () => updateCategoryOptions(categoryInput, categoryLabel, false));
});

document.querySelectorAll('input[name="editType"]').forEach(radio => {
    radio.addEventListener("change", () => updateCategoryOptions(editCategoryInput, null, true));
});

/* ============================================================================
   7. LOAD TRANSACTIONS (FROM SUPABASE)
   ============================================================================ */

async function loadTransactions() {
    if (!currentUser) return;

    if (loadingSkeleton) loadingSkeleton.classList.remove("hidden");
    if (transactionTable) transactionTable.innerHTML = "";
    if (mobileTransactions) mobileTransactions.innerHTML = "";

    try {
        if (!isSupabaseConfigured) {
            // Local fallback demo data
            const key = `expenseXTransactions_${currentUser.email || currentUser.id}`;
            allTransactions = JSON.parse(localStorage.getItem(key)) || [];
        } else {
            const { data, error } = await supabase
                .from("transactions")
                .select("*")
                .order("date", { ascending: false })
                .order("created_at", { ascending: false });

            if (error) throw error;
            allTransactions = data || [];
        }

        applyFiltersAndRender();
        updateDashboard(allTransactions);

    } catch (err) {
        console.error("Error loading transactions:", err);
        showToast("Could not load transactions from database.", "error");
    } finally {
        if (loadingSkeleton) loadingSkeleton.classList.add("hidden");
    }
}

/* ============================================================================
   8. ADD TRANSACTION (SUPABASE INSERT)
   ============================================================================ */

if (transactionForm) {
    transactionForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        hideFormError();

        if (!currentUser) {
            showFormError("You must be logged in to add a transaction.");
            return;
        }

        const typeRadio = document.querySelector('input[name="type"]:checked');
        const type = typeRadio ? typeRadio.value : "Income";
        const amount = parseFloat(amountInput.value);
        const category = categoryInput.value;
        const description = descriptionInput.value.trim();
        const date = dateInput.value;

        // Validation
        if (isNaN(amount) || amount <= 0) {
            showFormError("Please enter a valid positive amount.");
            return;
        }
        if (!category) {
            showFormError("Please select a category.");
            return;
        }
        if (!description) {
            showFormError("Description is required.");
            return;
        }
        if (!date) {
            showFormError("Please select a valid transaction date.");
            return;
        }

        // Prevent double submit
        setAddButtonLoading(true);

        const newRecord = {
            user_id: currentUser.id,
            type: type,
            category: category,
            description: description,
            amount: amount,
            date: date
        };

        try {
            if (!isSupabaseConfigured) {
                // Demo fallback
                newRecord.id = "local_" + Date.now();
                newRecord.created_at = new Date().toISOString();
                allTransactions.unshift(newRecord);
                saveLocalTransactions();
            } else {
                const { data, error } = await supabase
                    .from("transactions")
                    .insert([newRecord])
                    .select();

                if (error) throw error;
                if (data && data[0]) {
                    allTransactions.unshift(data[0]);
                } else {
                    await loadTransactions();
                }
            }

            showToast("Transaction added successfully!", "success");

            // Reset Form & restore Income default
            transactionForm.reset();
            const incomeRadio = document.querySelector('input[name="type"][value="Income"]');
            if (incomeRadio) incomeRadio.checked = true;
            updateCategoryOptions();
            setDefaultTodayDate();

            // Refresh UI
            applyFiltersAndRender();
            updateDashboard(allTransactions);

        } catch (err) {
            console.error("Error inserting transaction:", err);
            showFormError(err.message || "Failed to save transaction to database.");
            showToast("Failed to add transaction.", "error");
        } finally {
            setAddButtonLoading(false);
        }
    });
}

function setAddButtonLoading(isLoading) {
    if (!addSubmitBtn) return;
    addSubmitBtn.disabled = isLoading;
    if (isLoading) {
        addPlusIcon.classList.add("hidden");
        addSpinner.classList.remove("hidden");
        addBtnText.textContent = "Saving...";
    } else {
        addPlusIcon.classList.remove("hidden");
        addSpinner.classList.add("hidden");
        addBtnText.textContent = "Save Transaction";
    }
}

function showFormError(msg) {
    if (errorMessageText) errorMessageText.textContent = msg;
    if (errorMessage) errorMessage.classList.remove("hidden");
}

function hideFormError() {
    if (errorMessage) errorMessage.classList.add("hidden");
}

function saveLocalTransactions() {
    if (!currentUser) return;
    const key = `expenseXTransactions_${currentUser.email || currentUser.id}`;
    localStorage.setItem(key, JSON.stringify(allTransactions));
}

/* ============================================================================
   9. EDIT TRANSACTION (SUPABASE UPDATE)
   ============================================================================ */

function openEditModal(id) {
    const item = allTransactions.find(t => String(t.id) === String(id));
    if (!item) return;

    editIdInput.value = item.id;
    const typeRadio = document.querySelector(`input[name="editType"][value="${item.type}"]`);
    if (typeRadio) typeRadio.checked = true;

    updateCategoryOptions(editCategoryInput, null, true);
    editCategoryInput.value = item.category;
    editAmountInput.value = item.amount;
    editDescriptionInput.value = item.description;
    editDateInput.value = item.date;

    editModal.classList.remove("hidden");
}

function closeEditModal() {
    if (editModal) editModal.classList.add("hidden");
}

if (editForm) {
    editForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const id = editIdInput.value;
        const typeRadio = document.querySelector('input[name="editType"]:checked');
        const type = typeRadio ? typeRadio.value : "Income";
        const amount = parseFloat(editAmountInput.value);
        const category = editCategoryInput.value;
        const description = editDescriptionInput.value.trim();
        const date = editDateInput.value;

        if (isNaN(amount) || amount <= 0 || !category || !description || !date) {
            showToast("Please fill all fields with valid data.", "error");
            return;
        }

        const editSaveBtn = document.getElementById("editSaveBtn");
        if (editSaveBtn) editSaveBtn.disabled = true;

        try {
            if (!isSupabaseConfigured) {
                const idx = allTransactions.findIndex(t => String(t.id) === String(id));
                if (idx !== -1) {
                    allTransactions[idx] = { ...allTransactions[idx], type, amount, category, description, date };
                    saveLocalTransactions();
                }
            } else {
                const { error } = await supabase
                    .from("transactions")
                    .update({ type, amount, category, description, date })
                    .eq("id", id);

                if (error) throw error;

                const idx = allTransactions.findIndex(t => String(t.id) === String(id));
                if (idx !== -1) {
                    allTransactions[idx] = { ...allTransactions[idx], type, amount, category, description, date };
                }
            }

            showToast("Transaction updated successfully!", "success");
            closeEditModal();
            applyFiltersAndRender();
            updateDashboard(allTransactions);

        } catch (err) {
            console.error("Error updating transaction:", err);
            showToast("Failed to update transaction.", "error");
        } finally {
            if (editSaveBtn) editSaveBtn.disabled = false;
        }
    });
}

/* ============================================================================
   10. DELETE TRANSACTION (SUPABASE DELETE)
   ============================================================================ */

function requestDeleteTransaction(id) {
    pendingDeleteId = id;
    if (deleteModal) deleteModal.classList.remove("hidden");
}

function closeDeleteModal() {
    pendingDeleteId = null;
    if (deleteModal) deleteModal.classList.add("hidden");
}

if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener("click", async () => {
        if (!pendingDeleteId) return;
        const idToDelete = pendingDeleteId;

        confirmDeleteBtn.disabled = true;
        confirmDeleteBtn.textContent = "Deleting...";

        try {
            if (!isSupabaseConfigured) {
                allTransactions = allTransactions.filter(t => String(t.id) !== String(idToDelete));
                saveLocalTransactions();
            } else {
                const { error } = await supabase
                    .from("transactions")
                    .delete()
                    .eq("id", idToDelete);

                if (error) throw error;

                allTransactions = allTransactions.filter(t => String(t.id) !== String(idToDelete));
            }

            showToast("Transaction deleted successfully.", "success");
            closeDeleteModal();
            applyFiltersAndRender();
            updateDashboard(allTransactions);

        } catch (err) {
            console.error("Error deleting transaction:", err);
            showToast("Failed to delete transaction.", "error");
        } finally {
            confirmDeleteBtn.disabled = false;
            confirmDeleteBtn.textContent = "Delete";
        }
    });
}

// Clear All User Transactions
if (clearAllBtn) {
    clearAllBtn.addEventListener("click", async () => {
        if (allTransactions.length === 0) {
            showToast("No transactions to clear.", "info");
            return;
        }

        const confirmed = confirm("Are you sure you want to delete ALL your transactions? This cannot be undone.");
        if (!confirmed) return;

        try {
            if (!isSupabaseConfigured) {
                allTransactions = [];
                saveLocalTransactions();
            } else {
                const { error } = await supabase
                    .from("transactions")
                    .delete()
                    .eq("user_id", currentUser.id);

                if (error) throw error;
                allTransactions = [];
            }

            showToast("All transactions cleared.", "success");
            applyFiltersAndRender();
            updateDashboard(allTransactions);

        } catch (err) {
            console.error("Error clearing transactions:", err);
            showToast("Failed to clear transactions.", "error");
        }
    });
}

/* ============================================================================
   11. SEARCH & FILTERING (CLIENT-SIDE REACTIVE)
   ============================================================================ */

function applyFiltersAndRender() {
    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : "";
    const selectedType = typeFilter ? typeFilter.value : "All";
    const selectedCategory = categoryFilter ? categoryFilter.value : "All";
    const selectedMonth = monthFilter ? monthFilter.value : ""; // YYYY-MM

    const filtered = allTransactions.filter(item => {
        // Search matches description or category
        const desc = (item.description || "").toLowerCase();
        const cat = (item.category || "").toLowerCase();
        const matchesSearch = !searchTerm || desc.includes(searchTerm) || cat.includes(searchTerm);

        // Type match (Income / Expense)
        const matchesType = selectedType === "All" || item.type.toLowerCase() === selectedType.toLowerCase();

        // Category match
        const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;

        // Date Month match
        const matchesMonth = !selectedMonth || (item.date && item.date.startsWith(selectedMonth));

        return matchesSearch && matchesType && matchesCategory && matchesMonth;
    });

    if (filteredCountBadge) {
        filteredCountBadge.textContent = `${filtered.length} item${filtered.length === 1 ? "" : "s"}`;
    }

    renderTransactions(filtered);
}

// Attach filter listeners
if (searchInput) searchInput.addEventListener("input", applyFiltersAndRender);
if (typeFilter) typeFilter.addEventListener("change", applyFiltersAndRender);
if (categoryFilter) categoryFilter.addEventListener("change", applyFiltersAndRender);
if (monthFilter) monthFilter.addEventListener("change", applyFiltersAndRender);

if (resetFiltersBtn) {
    resetFiltersBtn.addEventListener("click", () => {
        if (searchInput) searchInput.value = "";
        if (typeFilter) typeFilter.value = "All";
        if (categoryFilter) categoryFilter.value = "All";
        if (monthFilter) monthFilter.value = "";
        applyFiltersAndRender();
        showToast("Filters reset", "info");
    });
}

/* ============================================================================
   12. RENDER TRANSACTIONS (TABLE & MOBILE CARDS)
   ============================================================================ */

function renderTransactions(list) {
    if (!transactionTable || !mobileTransactions) return;

    transactionTable.innerHTML = "";
    mobileTransactions.innerHTML = "";

    if (!list || list.length === 0) {
        if (emptyMessage) emptyMessage.classList.remove("hidden");
        return;
    }

    if (emptyMessage) emptyMessage.classList.add("hidden");

    list.forEach(item => {
        const isIncome = item.type.toLowerCase() === "income";
        const amountNum = Number(item.amount) || 0;
        const formattedAmount = `₹${amountNum.toFixed(2)}`;
        const sign = isIncome ? "+" : "-";
        const amountColorClass = isIncome ? "text-emerald-600" : "text-rose-600";
        const typeBadge = isIncome
            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
            : "bg-rose-50 text-rose-700 border border-rose-200";

        // Desktop Table Row
        const tr = document.createElement("tr");
        tr.className = "hover:bg-slate-50/80 transition-colors";
        tr.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-xs font-medium text-slate-500">
                ${escapeHTML(formatDisplayDate(item.date))}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${typeBadge}">
                    ${isIncome ? "↑ Income" : "↓ Expense"}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-medium bg-slate-100 text-slate-700">
                    ${escapeHTML(item.category)}
                </span>
            </td>
            <td class="px-6 py-4 text-slate-800 font-medium">
                ${escapeHTML(item.description || "-")}
            </td>
            <td class="px-6 py-4 text-right whitespace-nowrap font-bold ${amountColorClass}">
                ${sign} ${formattedAmount}
            </td>
            <td class="px-6 py-4 text-center whitespace-nowrap">
                <div class="inline-flex items-center gap-1">
                    <button onclick="openEditModal('${item.id}')" title="Edit" class="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                    </button>
                    <button onclick="requestDeleteTransaction('${item.id}')" title="Delete" class="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    </button>
                </div>
            </td>
        `;
        transactionTable.appendChild(tr);

        // Mobile Responsive Card
        const card = document.createElement("div");
        card.className = "bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3";
        card.innerHTML = `
            <div class="flex items-start justify-between gap-3">
                <div class="flex-1">
                    <div class="flex items-center gap-2 mb-1">
                        <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${typeBadge}">
                            ${item.type}
                        </span>
                        <span class="text-[11px] text-slate-400 font-medium">${escapeHTML(formatDisplayDate(item.date))}</span>
                    </div>
                    <h4 class="text-sm font-bold text-slate-900">${escapeHTML(item.description || item.category)}</h4>
                    <p class="text-xs text-slate-500 mt-0.5">${escapeHTML(item.category)}</p>
                </div>
                <div class="text-right">
                    <p class="text-base font-extrabold ${amountColorClass}">
                        ${sign} ${formattedAmount}
                    </p>
                </div>
            </div>
            <div class="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                <button onclick="openEditModal('${item.id}')" class="text-xs font-semibold px-3 py-1.5 rounded-lg text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition">
                    Edit
                </button>
                <button onclick="requestDeleteTransaction('${item.id}')" class="text-xs font-semibold px-3 py-1.5 rounded-lg text-rose-600 bg-rose-50 hover:bg-rose-100 transition">
                    Delete
                </button>
            </div>
        `;
        mobileTransactions.appendChild(card);
    });
}

/* ============================================================================
   13. DASHBOARD STATS CALCULATIONS
   ============================================================================ */

function updateDashboard(items = allTransactions) {
    let incomeSum = 0;
    let expenseSum = 0;
    const currentMonthPrefix = new Date().toISOString().slice(0, 7); // YYYY-MM
    let currentMonthExpenseSum = 0;
    const categoryCounts = {};

    items.forEach(t => {
        const amt = Number(t.amount) || 0;
        const isInc = (t.type || "").toLowerCase() === "income";

        if (isInc) {
            incomeSum += amt;
        } else {
            expenseSum += amt;

            // Current month spending
            if (t.date && t.date.startsWith(currentMonthPrefix)) {
                currentMonthExpenseSum += amt;
            }

            // Category frequency
            const cat = t.category || "Uncategorized";
            categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
        }
    });

    const netBalance = incomeSum - expenseSum;

    // Format & inject
    if (totalIncome) totalIncome.textContent = `₹${incomeSum.toFixed(2)}`;
    if (totalExpense) totalExpense.textContent = `₹${expenseSum.toFixed(2)}`;
    if (balance) {
        balance.textContent = `₹${netBalance.toFixed(2)}`;
        if (netBalance < 0) {
            balance.className = "text-2xl sm:text-3xl font-extrabold text-rose-600 tracking-tight";
            if (balanceStatus) {
                balanceStatus.className = "text-xs font-medium text-rose-600 mt-1 flex items-center gap-1";
                balanceStatus.innerHTML = "<span>●</span> Deficit Balance";
            }
        } else {
            balance.className = "text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight";
            if (balanceStatus) {
                balanceStatus.className = "text-xs font-medium text-emerald-600 mt-1 flex items-center gap-1";
                balanceStatus.innerHTML = "<span>●</span> Positive Net Worth";
            }
        }
    }

    if (transactionCount) transactionCount.textContent = items.length;

    // Current Month Widget
    if (currentMonthExpense) currentMonthExpense.textContent = `₹${currentMonthExpenseSum.toFixed(2)}`;
    if (currentMonthName) {
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const now = new Date();
        currentMonthName.textContent = `${monthNames[now.getMonth()]} ${now.getFullYear()} Outflows`;
    }

    // Most Used Expense Category Widget
    const categories = Object.keys(categoryCounts);
    if (categories.length === 0) {
        if (mostUsedCategory) mostUsedCategory.textContent = "None";
        if (mostUsedCategoryCount) mostUsedCategoryCount.textContent = "No expenses recorded";
    } else {
        let topCat = categories[0];
        let maxCount = categoryCounts[topCat];

        categories.forEach(cat => {
            if (categoryCounts[cat] > maxCount) {
                topCat = cat;
                maxCount = categoryCounts[cat];
            }
        });

        if (mostUsedCategory) mostUsedCategory.textContent = topCat;
        if (mostUsedCategoryCount) mostUsedCategoryCount.textContent = `${maxCount} transaction${maxCount === 1 ? "" : "s"}`;
    }
}

/* ============================================================================
   14. UTILITY & HELPER FUNCTIONS
   ============================================================================ */

function escapeHTML(str) {
    if (!str && str !== 0) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function formatDisplayDate(dateStr) {
    if (!dateStr) return "-";
    try {
        const parts = dateStr.split("-");
        if (parts.length === 3) {
            const year = parts[0];
            const month = parts[1];
            const day = parts[2];
            const dateObj = new Date(year, month - 1, day);
            return dateObj.toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric"
            });
        }
        return dateStr;
    } catch {
        return dateStr;
    }
}

function setDefaultTodayDate() {
    const today = new Date().toISOString().split("T")[0];
    if (dateInput && !dateInput.value) {
        dateInput.value = today;
    }
    if (currentDateDisplay) {
        currentDateDisplay.textContent = new Date().toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric"
        });
    }
}

/* ============================================================================
   15. APPLICATION BOOTSTRAP
   ============================================================================ */

document.addEventListener("DOMContentLoaded", () => {
    setDefaultTodayDate();
    updateCategoryOptions();
    initAuth();
    checkSession();
});
