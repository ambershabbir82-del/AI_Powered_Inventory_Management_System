const $ = (id) => document.getElementById(id);
let products = [];
let editingId = null;

function money(value) { return "$" + Number(value || 0).toFixed(2); }
function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
}
function toast(message) {
  $("toast").textContent = message;
  $("toast").classList.add("show");
  setTimeout(() => $("toast").classList.remove("show"), 2600);
}
async function api(url, options = {}) {
  const response = await fetch(url, {headers: {"Content-Type":"application/json"}, ...options});
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Something went wrong.");
  return data;
}
async function loadProducts() {
  try {
    const data = await api("/api/products");
    products = data.products;
    render(data.stats);
  } catch (error) { toast(error.message); }
}
function render(stats) {
  $("product-count").textContent = stats.product_count;
  $("total-units").textContent = stats.total_units;
  $("inventory-value").textContent = money(stats.inventory_value);
  $("low-stock").textContent = stats.low_stock;
  $("product-total").textContent = `${products.length} product${products.length === 1 ? "" : "s"}`;
  const query = $("search").value.toLowerCase();
  const filtered = products.filter(p => [p.id,p.name,p.category].some(v => String(v).toLowerCase().includes(query)));
  $("products-body").innerHTML = filtered.map(p => {
    const statusClass = p.status === "In stock" ? "in-stock" : p.status === "Low stock" ? "low-stock" : "out-of-stock";
    return `<tr><td>${escapeHtml(p.name)}<span class="product-id">${escapeHtml(p.id)}</span></td><td>${escapeHtml(p.category)}</td><td>${money(p.price)}</td><td>${p.quantity}</td><td><span class="status ${statusClass}">${escapeHtml(p.status)}</span></td><td><button class="action-btn" data-edit="${escapeHtml(p.id)}">Edit</button><button class="action-btn delete-btn" data-delete="${escapeHtml(p.id)}">Delete</button></td></tr>`;
  }).join("");
  $("empty-state").hidden = filtered.length !== 0;
  const alerts = products.filter(p => p.status !== "In stock");
  $("alert-count").textContent = alerts.length;
  $("alerts-list").innerHTML = alerts.length ? alerts.map(p => `<div class="alert-item"><div class="alert-symbol ${p.quantity===0?'red':''}">${p.quantity===0?'!':'↘'}</div><div><strong>${escapeHtml(p.name)}</strong><small>${p.quantity===0?'Out of stock':`${p.quantity} left · reorder level ${p.reorder_level}`}</small></div></div>`).join("") : '<div class="no-alerts">✓ All products are above their reorder levels.</div>';
}
function openModal(product = null) {
  editingId = product ? product.id : null;
  $("modal-title").textContent = product ? "Edit product" : "Add product";
  const form = $("product-form");
  form.reset();
  if (product) Object.entries(product).forEach(([key,value]) => { if (form.elements[key]) form.elements[key].value = value ?? ""; });
  form.elements.id.disabled = Boolean(product);
  $("modal").hidden = false;
}
function closeModal() { $("modal").hidden = true; $("product-form").elements.id.disabled = false; }
$("add-btn").addEventListener("click", () => openModal());
$("close-modal").addEventListener("click", closeModal);
$("cancel-modal").addEventListener("click", closeModal);
$("modal").addEventListener("click", e => { if (e.target === $("modal")) closeModal(); });
$("search").addEventListener("input", () => renderStatsOnly());
function renderStatsOnly() {
  const stats = {product_count:products.length,total_units:products.reduce((a,p)=>a+p.quantity,0),inventory_value:products.reduce((a,p)=>a+p.price*p.quantity,0),low_stock:products.filter(p=>p.quantity>0&&p.quantity<=p.reorder_level).length};
  render(stats);
}
$("product-form").addEventListener("submit", async e => {
  e.preventDefault();
  const form = new FormData(e.currentTarget);
  const payload = Object.fromEntries(form.entries());
  try {
    const result = editingId
      ? await api(`/api/products/${encodeURIComponent(editingId)}`, {method:"PUT",body:JSON.stringify(payload)})
      : await api("/api/products", {method:"POST",body:JSON.stringify(payload)});
    toast(result.message); closeModal(); await loadProducts();
  } catch (error) { toast(error.message); }
});
$("products-body").addEventListener("click", async e => {
  const edit = e.target.dataset.edit;
  const del = e.target.dataset.delete;
  if (edit) openModal(products.find(p => p.id === edit));
  if (del && confirm("Delete this product? This cannot be undone.")) {
    try { const result = await api(`/api/products/${encodeURIComponent(del)}`, {method:"DELETE"}); toast(result.message); await loadProducts(); }
    catch (error) { toast(error.message); }
  }
});
async function runAI(action, extra = {}) {
  const resultBox = $("ai-result");
  $("ai-result-text").textContent = "Thinking…";
  resultBox.hidden = false;
  try {
    const data = await api(`/api/ai/${action}`, {method:"POST",body:JSON.stringify(extra)});
    $("ai-result-text").textContent = data.result;
  } catch (error) { $("ai-result-text").textContent = error.message; }
}
document.querySelectorAll("[data-ai]").forEach(button => button.addEventListener("click", () => runAI(button.dataset.ai)));
$("ask-btn").addEventListener("click", () => {
  const question = $("ai-question").value.trim();
  if (!question) return toast("Type a question first.");
  runAI("ask", {question});
});
$("ai-question").addEventListener("keydown", e => { if (e.key === "Enter") $("ask-btn").click(); });
$("description-btn").addEventListener("click", () => {
  const name = prompt("Enter the product name:");
  if (!name || !name.trim()) return;
  const category = prompt("Enter its category (optional):") || "";
  runAI("description", {name:name.trim(),category});
});
loadProducts();
