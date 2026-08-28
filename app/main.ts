import {getProducts} from "./products-store";
import {Product} from "./types";

const productListEl = document.getElementById('product-list');
const productModal = document.getElementById('product-modal');
const addProductBtn = document.getElementById('add-product-btn');
const cancelBtn = document.getElementById('cancel-btn');

function renderProducts(products: Product[]) {
  if (!productListEl) return;
  
  productListEl.innerHTML = '';
  
  products.forEach(product => {
    const card = document.createElement('div');
    card.className = 'product-card';
    
    card.innerHTML = `
      <h3>${product.title}</h3>
      ${product.brand ? `<div class="product-brand">${product.brand}</div>` : ''}
      <div class="product-description">${product.description}</div>
      <div class="product-price">$${product.price.toFixed(2)}</div>
      <div class="product-actions">
        <button class="btn btn-secondary edit-btn" data-id="${product.id}">Edit</button>
        <button class="btn btn-danger delete-btn" data-id="${product.id}">Delete</button>
      </div>
    `;
    
    productListEl.appendChild(card);
  });
}

let products = getProducts();
// Initial render
renderProducts(products);

// Modal logic (dummy implementations for students to fill out)
addProductBtn?.addEventListener('click', () => {
  productModal?.classList.add('active');
});

cancelBtn?.addEventListener('click', () => {
  productModal?.classList.remove('active');
});

// Event delegation for dynamically rendered buttons
productListEl?.addEventListener('click', (e) => {
  const target = e.target as HTMLElement;
  
  if (target.classList.contains('edit-btn')) {
    const productId = target.getAttribute('data-id');
    console.log('Edit clicked for product ID:', productId);
    // Student exercise: Populate form and open modal
    productModal?.classList.add('active');
  }
  
  if (target.classList.contains('delete-btn')) {
    const productId = target.getAttribute('data-id');
    console.log('Delete clicked for product ID:', productId);
    // Student exercise: Delete product from array and re-render
  }
});

// Sorting logic placeholders
const sortField = document.getElementById('sort-field') as HTMLSelectElement;
const sortOrder = document.getElementById('sort-order') as HTMLSelectElement;

sortField?.addEventListener('change', (e) => {
  const target = e.target as HTMLSelectElement;
  console.log('Sort field changed to:', target.value);
  // Student exercise: Implement sorting logic based on selected field and order, then re-render
});

sortOrder?.addEventListener('change', (e) => {
  const target = e.target as HTMLSelectElement;
  console.log('Sort order changed to:', target.value);
  // Student exercise: Implement sorting logic based on selected field and order, then re-render
});
