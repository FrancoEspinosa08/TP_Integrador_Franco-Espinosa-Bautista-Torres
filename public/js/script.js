let productosDisponibles = [];

async function cargarProductos() {
    try {
        const respuesta = await fetch('/api/productos');
        const resultado = await respuesta.json();

        if (respuesta.ok && resultado.success) {
            productosDisponibles = resultado.data;
            renderizarProductos(productosDisponibles);
        }
    } catch (error) {
        console.log("Error de conexión:", error);
    }
}

let carritoCompras = [];

function renderizarProductos(productosAMostrar) {
    const grilla = document.getElementById("grilla-productos");
    if (!grilla) return;
    grilla.innerHTML = "";

    productosAMostrar.forEach(producto => {
        const tarjeta = document.createElement("div");
        tarjeta.className = "tarjeta-producto";
        tarjeta.innerHTML = `
            <img src="${producto.imagen || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=300'}" alt="${producto.nombre}" style="width: 100%; height: 140px; object-fit: cover; border-radius: 6px; margin-bottom: 10px;">
            <div>
                <h3>${producto.nombre}</h3>
                <p class="precio-producto">$${producto.precio.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</p>
                <small style="color: #666;">Stock: ${producto.stock}</small>
            </div>
            <button class="btn-agregar" onclick="agregarAlCarrito(${producto.id})">Agregar</button>
        `;
        grilla.appendChild(tarjeta);
    });
}

function filtrarProductos(categoria, evento) {
    document.querySelectorAll('.btn-categoria').forEach(btn => btn.classList.remove('activo'));
    if(evento) evento.target.classList.add('activo');

    if (categoria === 'todos') {
        renderizarProductos(productosDisponibles);
    } else {
        const productosFiltrados = productosDisponibles.filter(prod => prod.tipo === categoria);
        renderizarProductos(productosFiltrados);
    }
}

function agregarAlCarrito(idProducto) {
    const productoEncontrado = productosDisponibles.find(prod => prod.id === idProducto);
    const itemExistente = carritoCompras.find(item => item.id === idProducto);

    if (itemExistente) {
        if (itemExistente.cantidad < productoEncontrado.stock) {
            itemExistente.cantidad += 1;
        } else {
            alert("No hay más stock disponible para este producto.");
            return;
        }
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

function quitarDelCarrito(idProducto) {
    const itemExistente = carritoCompras.find(item => item.id === idProducto);
    if (itemExistente.cantidad > 1) {
        itemExistente.cantidad -= 1;
    } else {
        carritoCompras = carritoCompras.filter(item => item.id !== idProducto);
    }
    actualizarVistaCarrito();
}

function actualizarVistaCarrito() {
    const contenedorCarrito = document.getElementById("lista-carrito");
    const etiquetaTotal = document.getElementById("precio-total");
    if (!contenedorCarrito) return;

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
            <button onclick="quitarDelCarrito(${item.id})">Quitar</button>
        `;
        contenedorCarrito.appendChild(elementoItem);
    });

    etiquetaTotal.textContent = `$${sumaTotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`;
}

async function finalizarCompra() {
    if (carritoCompras.length === 0) {
        alert("Debe agregar al menos un producto para finalizar la compra.");
        return;
    }

    const nombre = sessionStorage.getItem("nombreCliente");

    try {
        const respuesta = await fetch('/compra', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nombre: nombre,
                productos: carritoCompras
            })
        });

        const resultado = await respuesta.json();

        if (respuesta.ok && resultado.success) {
            window.location.href = '/compra/ticket';
        } else {
            alert("No se pudo finalizar la compra.");
        }

    } catch (error) {
        console.log("Error al finalizar la compra:", error);
        alert("Error de conexión con el servidor.");
    }
}

function reiniciarKiosco() {
    carritoCompras = [];
    actualizarVistaCarrito();
    window.location.href = "/";
}

if (document.getElementById("grilla-productos")) {
    cargarProductos();
}

function mostrarNombreCliente(){
    const nombre = sessionStorage.getItem("nombreCliente");

    document.getElementById("nombre-cliente").textContent = "Cliente: " + nombre;
}

function salirCliente(){
    sessionStorage.removeItem("nombreCliente");
    window.location.href = "/";
}

if (document.getElementById("nombre-cliente")) {
    mostrarNombreCliente();
}