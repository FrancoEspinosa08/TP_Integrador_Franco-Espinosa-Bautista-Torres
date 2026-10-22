// Catálogo de productos del kiosco tecnológico
const productosDisponibles = [
    { id: 1, nombre: "Auriculares In-Ear con Micrófono", tipo: "perifericos", precio: 8500.00 },
    { id: 2, nombre: "Cable USB-C Carga Rápida 1m", tipo: "perifericos", precio: 4200.00 },
    { id: 3, nombre: "Adaptador Multiport USB-C a HDMI", tipo: "perifericos", precio: 18900.00 },
    { id: 4, nombre: "Pendrive USB 3.0 64GB", tipo: "perifericos", precio: 9500.00 },
    { id: 5, nombre: "Mousepad Gaming XL Borde Cosido", tipo: "escritorio", precio: 11000.00 },
    { id: 6, nombre: "Soporte de Aluminio Plegable Celular", tipo: "escritorio", precio: 7800.00 },
    { id: 7, nombre: "Organizador de Cables Silicona", tipo: "escritorio", precio: 3500.00 },
    { id: 8, nombre: "Lámpara LED de Escritorio USB", tipo: "escritorio", precio: 14500.00 }
];

// Estado del carrito de compras
let carritoCompras = [];

// Función para renderizar tarjetas de productos en el catálogo
function renderizarProductos(productosAMostrar) {
    const grilla = document.getElementById("grilla-productos");
    grilla.innerHTML = "";

    productosAMostrar.forEach(producto => {
        const tarjeta = document.createElement("div");
        tarjeta.className = "tarjeta-producto";
        tarjeta.innerHTML = `
            <div>
                <h3>${producto.nombre}</h3>
                <p class="precio-producto">$${producto.precio.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</p>
            </div>
            <button class="btn-agregar" onclick="agregarAlCarrito(${producto.id})">Agregar</button>
        `;
        grilla.appendChild(tarjeta);
    });
}

// Función para filtrar productos por tipo
function filtrarProductos(categoria, evento) {
    document.querySelectorAll('.btn-categoria').forEach(btn => btn.classList.remove('activo'));
    evento.target.classList.add('activo');

    if (categoria === 'todos') {
        renderizarProductos(productosDisponibles);
    } else {
        const productosFiltrados = productosDisponibles.filter(prod => prod.tipo === categoria);
        renderizarProductos(productosFiltrados);
    }
}

// Función para agregar ítems al carrito
function agregarAlCarrito(idProducto) {
    const productoEncontrado = productosDisponibles.find(prod => prod.id === idProducto);
    const itemExistente = carritoCompras.find(item => item.id === idProducto);

    if (itemExistente) {
        itemExistente.cantidad += 1;
    } else {
        carritoCompras.push({
            id: productoEncontrado.id,
            nombre: productoEncontrado.nombre,
            precio: productoEncontrado.precio,
            cantidad: 1
        });
    }

    actualizarVistaCarrito();
}

// Función para actualizar el panel lateral del carrito
function actualizarVistaCarrito() {
    const contenedorCarrito = document.getElementById("lista-carrito");
    const etiquetaTotal = document.getElementById("precio-total");

    if (carritoCompras.length === 0) {
        contenedorCarrito.innerHTML = `<p style="color: #64748b; text-align: center; margin-top: 2rem;">El carrito está vacío</p>`;
        etiquetaTotal.textContent = "$0.00";
        return;
    }

    contenedorCarrito.innerHTML = "";
    let sumaTotal = 0;

    carritoCompras.forEach(item => {
        const subtotal = item.precio * item.cantidad;
        sumaTotal += subtotal;

        const elementoItem = document.createElement("div");
        elementoItem.className = "item-carrito";
        elementoItem.innerHTML = `
            <div>
                <strong>${item.nombre}</strong><br>
                <small>Cant: ${item.cantidad} x $${item.precio.toLocaleString('es-AR')}</small>
            </div>
            <span>$${subtotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
        `;
        contenedorCarrito.appendChild(elementoItem);
    });

    etiquetaTotal.textContent = `$${sumaTotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`;
}

// Función para procesar y emitir el ticket de compra
function finalizarCompra() {
    if (carritoCompras.length === 0) {
        alert("Debe agregar al menos un producto para finalizar la compra.");
        return;
    }

    const fechaActual = new Date().toLocaleString('es-AR');
    let sumaTotal = carritoCompras.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
    
    let detalleTexto = `FECHA: ${fechaActual}<br>----------------------------------------<br>`;
    carritoCompras.forEach(item => {
        detalleTexto += `${item.cantidad}x ${item.nombre} - $${(item.precio * item.cantidad).toLocaleString('es-AR')}<br>`;
    });
    detalleTexto += `----------------------------------------<br><strong>TOTAL: $${sumaTotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</strong>`;

    document.getElementById("ticket-detalle").innerHTML = detalleTexto;
    document.getElementById("modal-ticket").style.display = "flex";
}

// Función para reiniciar el kiosco de autoservicio
function reiniciarKiosco() {
    carritoCompras = [];
    actualizarVistaCarrito();
    document.getElementById("modal-ticket").style.display = "none";
}

// Inicializar la grilla de productos al cargar el script
renderizarProductos(productosDisponibles);