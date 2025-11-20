import { Component, OnInit } from '@angular/core';
import { ProductosService } from '../../../../core/services/productos.service';
import { AlertasService } from '../../../../core/services/alertas.service';
import { Producto } from '../../models/productos.model';
import { TablaBaseComponent } from '../../../../shared/components/tabla-base/tabla-base.component';
import { CommonModule } from '@angular/common';
import { ResultadosBuscarRegistrosComponent } from '../../../../shared/components/resultados-buscar-registros/resultados-buscar-registros.component';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { VistaImagenProductoComponent } from '../../../../shared/components/vista-imagen-producto/vista-imagen-producto.component';
import { FiltrosComponent } from '../../../../shared/components/filtros/filtros.component';

@Component({
  selector: 'app-productos',
  imports: [
    TablaBaseComponent,
    CommonModule,
    ResultadosBuscarRegistrosComponent,
    ReactiveFormsModule,
    VistaImagenProductoComponent,
    FiltrosComponent,
  ],
  templateUrl: './productos.component.html',
  styleUrl: './productos.component.css',
})
export class ProductosComponent {
  registros: any[] = [];
  registrosFiltrados: any[] = [];
  mostrarFormulario = false;
  tablaSeleccionada: string = 'productos';
  tipoSeleccionado: string = '';
  ordenSeleccionado: string = '';
  selectedFile: File | null = null;
  mostrarImagenProducto = false;
  productoSeleccionado: any = null;
  mostrarFormularioVenta: boolean = false;
  productoParaVender: any = null;

  // Para subir imagen a producto existente
  formularioImagenVisible = false;
  nombreImagenSeleccionada: string | null = null;
  archivoSeleccionado: File | null = null;

  tipos = [
    { valor: 'tornillo', nombre: 'Tornillo' },
    { valor: 'herramienta', nombre: 'Herramienta' },
    { valor: 'griferia', nombre: 'Griferia' },
    { valor: 'electrico', nombre: 'Electrico' },
    { valor: 'gas', nombre: 'Gas' },
    { valor: 'pintura', nombre: 'Pintura' },
    { valor: 'alcantarillado', nombre: 'Alcantarillado' },
    { valor: 'accesorio', nombre: 'Accesorio' },
    { valor: 'estufa', nombre: 'Estufa' },
    { valor: 'cerrajeria', nombre: 'Cerrajeria' },
    { valor: 'material', nombre: 'Material' },
  ];

  tiposFiltro = [{ valor: 'todo', nombre: 'Todo' }, ...this.tipos];

  // Configuración de columnas para tabla-base
  columnas = [
    { campo: 'idProducto', titulo: 'Codigo', editable: false },
    { campo: 'nombre', titulo: 'Nombre', editable: true },
    {
      campo: 'tipo',
      titulo: 'Tipo',
      editable: true,
      opciones: this.tipos,
      formato: 'titlecase',
    },
    {
      campo: 'precio',
      titulo: 'Precio',
      tipo: 'number',
      formato: 'currency',
      editable: true,
    },
    {
      campo: 'precioDescuento',
      titulo: 'Precio Descuento',
      tipo: 'number',
      formato: 'currency',
      editable: true,
    },
    {
      campo: 'cantidad',
      titulo: 'Cantidad',
      tipo: 'number',
      formato: 'numero',
      editable: true,
    },
  ];

  // Botón extra para la tabla
  botonExtra = {
    icono: 'bi bi-eye',
    tooltip: 'Ver imagen del producto',
    accion: 'verImagen',
    color: 'btn-secondary',
    texto: 'Ver',
  };

  productoForm: FormGroup;
  ventaForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private productoServicio: ProductosService,
    private alertasService: AlertasService
  ) {
    this.productoServicio.selectedOption$.subscribe((option) => {
      this.tipoSeleccionado = option;
      this.obtenerRegistros();
    });

    // Formulario para productos
    this.productoForm = this.fb.group({
      idProducto: [{ value: '', disabled: true }],
      nombre: ['', Validators.required],
      tipo: ['', Validators.required],
      precio: ['', [Validators.required, Validators.min(1)]],
      precioDescuento: [null],
      cantidad: ['', Validators.required],
    });

    // Formulario para ventas
    this.ventaForm = this.fb.group({
      idVenta: ['', Validators.required],
      cliente: ['', Validators.required],
      fecha: ['', Validators.required],
      total: ['', [Validators.required, Validators.min(1)]],
    });
  }
  ngOnInit() {
    this.obtenerRegistros();
    this.productoServicio.onProductosActualizados().subscribe(() => {
      this.obtenerRegistros(); // vuelve a consultar o refrescar la lista
    });
  }

  obtenerRegistros() {
    this.productoServicio.obtenerTodos().subscribe((data) => {
      this.registros = data;
      this.registrosFiltrados = [...this.registros]; // inicialmente sin filtros
    });
  }

  actualizarRegistrosFiltrados(lista: any[]) {
    this.registrosFiltrados = lista;
  }

  // Métodos para manejar eventos de tabla-base
  onEditar(producto: any) {
    console.log('Editando producto:', producto);
  }

  onGuardar(productoEditado: any) {
    const { editando, ...registroLimpio } = productoEditado;

    this.productoServicio.editarProducto(registroLimpio).subscribe({
      next: () => {
        this.alertasService.mostrar('Producto editado con éxito', 'exito');
        this.obtenerRegistros();
        this.productoServicio.emitirActualizacion();
      },
      error: (err) => {
        console.error('Error al editar producto:', err);
        this.alertasService.mostrar('No se pudo editar el producto.', 'error');
      },
    });
  }

  onCancelar() {
    console.log('Edición cancelada');
  }

  onEliminar(producto: any) {
    this.alertasService
      .confirmar('¿Estás seguro de eliminar este producto?')
      .then((confirmado) => {
        if (confirmado) {
          this.productoServicio
            .eliminarProducto(producto.idProducto)
            .subscribe({
              next: () => {
                this.obtenerRegistros();
                this.productoServicio.emitirActualizacion();
                this.alertasService.mostrar(
                  'Producto eliminado con éxito.',
                  'exito'
                );
              },
              error: () => {
                this.alertasService.mostrar(
                  'Error al eliminar el producto.',
                  'error'
                );
              },
            });
        }
      });
  }

  onBotonExtra(event: { accion: string; fila: any }) {
    if (event.accion === 'verImagen') {
      this.verImagenProducto(event.fila);
    }
  }

  // Métodos de imágenes
  verImagenProducto(producto: any) {
    this.productoSeleccionado = producto;
    this.mostrarImagenProducto = true;
  }

  cerrarVistaImagen() {
    this.mostrarImagenProducto = false;
  }

  abrirFormularioImagen(producto: any) {
    this.productoSeleccionado = producto;
    this.formularioImagenVisible = true;
  }

  cerrarFormularioImagen() {
    this.formularioImagenVisible = false;
    this.nombreImagenSeleccionada = null;
    this.archivoSeleccionado = null;
  }

  onArchivoSeleccionado(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.archivoSeleccionado = file;
      this.nombreImagenSeleccionada = file.name;
    }
  }

  subirImagen() {
    if (!this.archivoSeleccionado || !this.productoSeleccionado) {
      this.alertasService.mostrar('Selecciona una imagen', 'advertencia');
      return;
    }

    const formData = new FormData();
    formData.append('file', this.archivoSeleccionado);
    formData.append('upload_preset', 'inventario-ferreteria');
    formData.append('cloud_name', 'dsdnkc3eb');

    fetch('https://api.cloudinary.com/v1_1/dsdnkc3eb/image/upload', {
      method: 'POST',
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        const productoActualizado = {
          ...this.productoSeleccionado,
          imagen: data.secure_url,
        };

        this.productoServicio.editarProducto(productoActualizado).subscribe({
          next: () => {
            this.alertasService.mostrar('Imagen subida con éxito', 'exito');
            this.obtenerRegistros();
            this.cerrarFormularioImagen();
          },
          error: (err) => {
            console.error('Error al actualizar producto:', err);
            this.alertasService.mostrar(
              'Error al actualizar el producto',
              'error'
            );
          },
        });
      })
      .catch((error) => {
        this.alertasService.mostrar('Error al subir la imagen', 'error');
        console.error('Cloudinary error:', error);
      });
  }

  // Agregar producto
  // Agregar producto
  agregarRegistro() {
    const form = this.productoForm;

    if (this.tablaSeleccionada === 'productos') {
      const idProducto = form.get('idProducto')?.value;

      if (!idProducto || idProducto.includes('...')) {
        this.alertasService.mostrar(
          '⚠️ Espera un momento, aún se está generando el ID del producto.',
          'info'
        );
        return;
      }
    }

    if (form.valid) {
      const idProd = this.productoForm.get('idProducto')?.value;
      if (this.tablaSeleccionada === 'productos' && !idProd) {
        this.alertasService.mostrar(
          'Espera un momento, aún se está generando el ID del producto.',
          'info'
        );
        return;
      }

      console.log('🚀 Enviando producto al backend:', form.value);

      if (this.tablaSeleccionada === 'productos' && this.selectedFile) {
        const formData = new FormData();
        formData.append('file', this.selectedFile);
        formData.append('upload_preset', 'inventario-ferreteria');
        formData.append('cloud_name', 'dsdnkc3eb');

        fetch('https://api.cloudinary.com/v1_1/dsdnkc3eb/image/upload', {
          method: 'POST',
          body: formData,
        })
          .then((res) => res.json())
          .then((data) => {
            const datosConImagen = {
              ...form.getRawValue(),
              imagen: data.secure_url,
            };

            this.productoServicio.agregarProducto(datosConImagen).subscribe({
              next: (response) => {
                this.alertasService.mostrar(
                  'Producto agregado con éxito.',
                  'exito'
                );
                this.obtenerRegistros();

                // ✅ Aquí notificamos a la barra de búsqueda
                this.productoServicio.emitirProductoCreado();

                form.reset();
                this.selectedFile = null;
                this.mostrarFormulario = false;
              },
              error: (err) => {
                this.alertasService.mostrar(
                  'No se pudo agregar el producto.',
                  'error'
                );
                console.error('Error al agregar producto:', err);
              },
            });
          })
          .catch((error) => {
            this.alertasService.mostrar('Error al subir la imagen', 'error');
            console.error('Cloudinary error:', error);
          });
      } else {
        this.productoServicio.agregarProducto(form.getRawValue()).subscribe({
          next: (response) => {
            this.alertasService.mostrar(
              'Producto agregado con éxito.',
              'exito'
            );
            this.obtenerRegistros();

            // ✅ Aquí también notificamos a la barra
            this.productoServicio.emitirProductoCreado();

            form.reset();
            this.mostrarFormulario = false;
          },
          error: (err) => {
            this.alertasService.mostrar(
              'No se pudo agregar el producto.',
              'error'
            );
            console.error('Error al agregar producto:', err);
          },
        });
      }
    } else {
      this.alertasService.mostrar(
        'Por favor, completa todos los campos obligatorios.',
        'advertencia'
      );
    }
  }

  onTipoChangeAgregar(): void {
    const tipo = this.productoForm.get('tipo')?.value;
    if (!tipo) return;

    let prefijo = '';
    switch (tipo) {
      case 'herramienta':
        prefijo = 'HER';
        break;
      case 'pintura':
        prefijo = 'PIN';
        break;
      case 'electrico':
        prefijo = 'ELE';
        break;
      case 'griferia':
        prefijo = 'GRI';
        break;
      case 'gas':
        prefijo = 'GAS';
        break;
      case 'tornillo':
        prefijo = 'TOR';
        break;
      case 'accesorio':
        prefijo = 'ACC';
        break;
      case 'cerrajeria':
        prefijo = 'CER';
        break;
      case 'material':
        prefijo = 'MAT';
        break;
      case 'estufa':
        prefijo = 'EST';
        break;
      case 'alcantarillado':
        prefijo = 'ALC';
        break;
      default:
        prefijo = tipo.substring(0, 3).toUpperCase();
    }

    this.productoForm.patchValue({ idProducto: '' });
    console.log(`⏳ Solicitando ID para prefijo: ${prefijo}`);

    this.productoServicio.obtenerUltimoId(prefijo).subscribe({
      next: (res) => {
        console.log('Respuesta del backend:', res);

        const id = res?.nuevoId;
        if (id) {
          console.log('ID recibido:', id);

          const control = this.productoForm.get('idProducto');
          control?.setValue(id);
          control?.updateValueAndValidity();

          console.log('📦 Form actualizado con ID:', this.productoForm.value);
        } else {
          console.error('Respuesta inesperada del servidor:', res);
          this.productoForm.get('idProducto')?.setValue('');
          this.alertasService.mostrar(
            'Error: el servidor no devolvió un ID válido.',
            'error'
          );
        }
      },
      error: (err) => {
        console.error('Error obteniendo el ID:', err);
        this.alertasService.mostrar(
          'Error al generar el ID del producto.',
          'error'
        );
        this.productoForm.get('idProducto')?.setValue('');
      },
    });
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  actualizarProductoEditado(productoEditado: any) {
    const index = this.registros.findIndex(
      (p) => p.idProducto === productoEditado.idProducto
    );
    if (index !== -1) {
      this.registros[index] = { ...productoEditado };
    }
  }

  actualizarLista(id: number) {
    this.registros = this.registros.filter(
      (producto) => producto.idProducto !== id
    );
  }

  venderProducto(producto: any) {
    this.productoParaVender = producto;
    this.mostrarFormularioVenta = true;
  }

  ventaRealizada(event: any) {
    console.log('Venta realizada:', event);
    this.mostrarFormularioVenta = false;
  }

  cerrarVenta() {
    this.mostrarFormularioVenta = false;
  }
}
