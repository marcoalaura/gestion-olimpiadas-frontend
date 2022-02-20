<template>
  <div class="pa-0">
    <h3>Ruta actual</h3>
    <div class="">
      <span>
        <a @click="listarRutaAnterior('raiz', -1)">[carpeta raiz]</a>
      </span> / <span v-for="(r, i) in ruta" v-bind:key="i"><a @click="listarRutaAnterior(r, i)">{{r}}</a> / </span>
    </div>
    <hr>
    <v-row>
      <v-col class="directorios" cols="12" md="6" v-if="!bRecursivo">
        <h3>Lista de carpetas</h3>
        <div style="overflow:auto;max-height:240px;">
          <directorio :carpetas="carpetas" :actualizarRuta="actualizarRuta" :profundidad="0"></directorio>
          <v-alert
            v-if="carpetas.length <= 0"
            type="info"
            text
            dense
            class="fs8 mb-0"
          >
            No hay carpetas en la ruta actual.
          </v-alert>
        </div>
        <div>
          <v-tooltip bottom color="primary">
            <template v-slot:activator="{ on }">
              Crear carpeta
              <v-btn
                  color="primary"
                  :small="['xs', 'sm'].includes($vuetify.breakpoint.name)"
                  icon
                  id="btnUploadFile"
                  v-on="on"
                  @click.native.stop="dialogNuevaCarpeta = true"
                  slot="activator"
              >
                <v-icon-component icon="add"/>
              </v-btn>
            </template>
            <span> Crear Carpeta </span>
          </v-tooltip>
        </div>
      </v-col>
      <v-col class="archivos" cols="12" :md="bRecursivo ? '12' : '6'">
        <h3>Lista de archivos</h3>
        <div style="overflow:auto;max-height:240px;">
          <archivo v-for="(a,i) in archivos" v-bind:key="i" :archivo="a" :ruta="ruta"></archivo>
          <v-alert
            v-if="archivos.length <= 0"
            type="info"
            text
            dense
            class="fs8 mb-0"
          >
            No hay imágenes <strong>{{ busqueda }}</strong> en la ruta actual.
          </v-alert>
        </div>
        <br>
        <div>
          <v-text-field
            label="Buscar imagen:"
            v-model="imagenContiene"
            @change="buscarImagen"
            :prepend-icon="bRecursivo ? 'image_search' : 'folder_open'"
            :append-icon="'search'"
            placeholder="Escriba algo para filtrar imagenes"
            dense
            :title="bRecursivo ? 'Busqueda recursiva' : 'Busqueda en la carpeta actual'"
            @click:prepend="modoBusqueda()"
            @click:append="buscarImagen"
          />
        </div>
        <div>
          <v-tooltip bottom color="primary">
            <template v-slot:activator="{ on }">
              Cargar imágenes en la ruta actual
              <v-btn
                  color="primary"
                  :small="['xs', 'sm'].includes($vuetify.breakpoint.name)"
                  icon
                  id="btnUploadFile"
                  v-on="on"
                  @click.native.stop="dialogSubirArchivos = true"
                  slot="activator"
              >
                <v-icon-component icon="file_upload"/>
              </v-btn>
            </template>
            <span> Cargar imágenes </span>
          </v-tooltip>
        </div>
      </v-col>
      <v-col cols="12" md="12">
        <h3>Vista previa</h3>
        <div>
          {{ archivoSeleccionado.nombre }} ({{ calcularTamano(archivoSeleccionado) }})
        </div>
        <div>
          <img src="" ref="vistaPrevia" style="width:100%;">
        </div>
      </v-col>
    </v-row>
    <v-dialog
      v-model="dialogNuevaCarpeta"
      persistent
      max-width="600px"
    >
      <v-card>
        <v-card-title>
          <span class="text-h5">Crear carpeta</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col
                cols="12"
                sm="12"
                md="12"
              >
                <v-text-field
                  v-model="nuevaCarpeta"
                  label="Nombre de la carpeta"
                  required
                ></v-text-field>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="blue darken-1"
            text
            @click="cerrarDialogNuevaCarpeta"
          >
            Cancelar
          </v-btn>
          <v-btn
            color="blue darken-1"
            text
            @click="crearCarpeta"
          >
            Aceptar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="dialogSubirArchivos"
      persistent
      max-width="600px"
    >
      <v-card
        v-cloak @drop.prevent="addDropFile" @dragover.prevent="dragOver" style="border:1px dotted #ddd"
      >
        <v-card-title>
          <span class="text-h5">Cargar imágenes</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col
                cols="12"
                sm="12"
                md="12"
              >
                <v-file-input
                  v-model="nuevoArchivos"
                  label="Archivos"
                  :accept="fileAccept"
                  multiple
                  @change="selectFile"
                  :hint="`Solo se admite archivos de imagen (${fileAccept})`"
                  persistent-hint
                  required
                ></v-file-input>
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <ol style="max-height:150px;overflow:auto;">
                  <li v-for="f in nuevoArchivos" v-bind:key="f.name">{{f.name}}<span :style="f.style"> ... {{f.mensaje}}</span></li>
                </ol>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="blue darken-1"
            text
            @click="cerrarDialogSubirArchivos"
          >
            Cerrar
          </v-btn>
          <v-btn
            color="blue darken-1"
            text
            @click="subirArchivos"
          >
            Aceptar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
import axios from 'axios';

import vIconComponent from '@/plugins/icon/index.vue';
import Directorio from './directorio.vue';
import Archivo from './archivo.vue';

const extensiones = process.env.VUE_APP_IMAGE_EXT || 'jpg,jpeg';

export default {
  name: 'subir-imagenes',
  components: {
    vIconComponent,
    Directorio,
    Archivo,
  },
  data() {
    return {
      lastDir: null,
      lastProfundidad: null,
      newProfundidad: null,
      dialogNuevaCarpeta: false,
      nuevaCarpeta: null,
      dialogSubirArchivos: false,
      nuevoArchivos: [],
      ruta: [],
      carpetas: [],
      archivos: [],
      archivoSeleccionado: {},
      imagenContiene: '',
      busqueda: '',
      bRecursivo: false,
      fileAccept: '',
    };
  },
  mounted() {
    this.imagenContiene = '';
    this.obtenerDatos();
    this.fileAccept = `.${extensiones.split(',').join(', .')}`;
  },
  methods: {
    obtenerDatos() {
      let url = `preguntas/imagenes?ruta=${this.ruta.join('/')}`;
      if (this.imagenContiene) {
        url += `&contiene=${this.imagenContiene}`;
      }
      if (this.bRecursivo) {
        url += '&recursivo=1';
      }
      this.$service.get(url).then((resp) => {
        if (resp.finalizado) {
          this.carpetas = resp.datos.filas.filter((dato) => dato.esDirectorio);
          this.archivos = resp.datos.filas.filter((dato) => dato.esArchivo);
        } else {
          this.carpetas = [];
          this.archivos = [];
        }
      });
    },
    actualizarRuta(dir) {
      this.ruta.push(dir.nombre);
      this.obtenerDatos();
      this.$refs.vistaPrevia.src = '';
      this.archivoSeleccionado = {};
    },
    listarRutaAnterior(nombre, indice) {
      if (indice < 0) indice = -1;
      this.ruta = this.ruta.slice(0, indice + 1);
      this.obtenerDatos();
      this.$refs.vistaPrevia.src = '';
      this.archivoSeleccionado = {};
    },
    cerrarDialogNuevaCarpeta() {
      this.nuevaCarpeta = null;
      this.dialogNuevaCarpeta = false;
    },
    crearCarpeta() {
      this.$service.post('preguntas/imagenes/carpetas', {
        carpeta: this.nuevaCarpeta,
        ruta: this.ruta.join('/'),
      }).then((resp) => {
        if (resp.finalizado) {
          this.nuevaCarpeta = null;
          this.dialogNuevaCarpeta = false;
          this.obtenerDatos();
        }
      });
    },
    cerrarDialogSubirArchivos() {
      this.nuevoArchivos = [];
      this.dialogSubirArchivos = false;
    },
    async subirArchivos() {
      let ocultarDialog = true;
      let i = 0;
      while (i < this.nuevoArchivos.length) {
        try {
          const archivo = this.nuevoArchivos[i];
          if (archivo.size > (3 * 1024 * 1024)) {
            throw new Error('El tamaño del archivo excede los 3 MB');
          }
          const formData = new FormData();
          formData.set('archivos', archivo, archivo.name);
          formData.set('size', archivo.size);
          formData.set('type', archivo.type);
          formData.set('ruta', this.ruta.join('/'));
          // eslint-disable-next-line no-await-in-loop
          const resp = await axios({
            method: 'POST',
            url: `${this.$baseServer}preguntas/imagenes/archivos`,
            data: formData,
            headers: {
              'Content-Type': 'application/octet-stream',
              Authorization: `Bearer ${this.$storage.get('token')}`,
            },
            // onUploadProgress: (event) => {
            //   console.log(event.loaded, 'subiendo...');
            // },
          });
          if (resp) {
            this.nuevoArchivos[i].mensaje = 'OK';
            this.nuevoArchivos[i].style = 'color:#449935;';
          }
        } catch (error) {
          this.nuevoArchivos[i].style = 'color:#d31419;';
          this.nuevoArchivos[i].mensaje = error.response?.data?.mensaje || error.message || 'Ocurrio un error.';
          ocultarDialog = false;
        }
        i++;
      }
      this.obtenerDatos();
      if (ocultarDialog) {
        this.dialogSubirArchivos = !ocultarDialog;
        this.nuevoArchivos = [];
      }
    },
    selectFile() {
      // console.log(this.nuevoArchivos, 'change');
    },
    dragOver() {
      console.log('dragOver');
    },
    addDropFile(e) {
      const reg = new RegExp(`.*(.${extensiones.split(',').join('|.')})$`, 'i');
      if (e && e.dataTransfer && e.dataTransfer.files) {
        this.nuevoArchivos = Object.values(e.dataTransfer.files).filter((f) => reg.test(f.name));
      }
    },
    calcularTamano(archivo) {
      let unidad = 'Bytes';
      let { tamano } = archivo;
      if (!tamano) return '';
      if (tamano >= 1000) {
        tamano = (tamano / 1000).toFixed(2);
        unidad = 'KB';
      }
      if (tamano >= 1000) {
        tamano = (tamano / 1000).toFixed(2);
        unidad = 'MB';
      }
      return `${tamano} ${unidad}` || '...';
    },

    buscarImagen() {
      this.obtenerDatos();
      if (this.imagenContiene) {
        this.busqueda = `con nombre ${this.imagenContiene}`;
      } else {
        this.busqueda = '';
      }
    },
    modoBusqueda() {
      this.bRecursivo = !this.bRecursivo;
      this.obtenerDatos();
    }
  },
};
</script>
<style lang="scss">
  .directorios {
    i {
      float: left;
    }
    a {
      line-height: 36px;
      text-decoration: none;
      vertical-align: top;
    }
    div.item:hover {
      background-color: #ddd;
      cursor: pointer;
    }
  }
  .archivos {
    div.item:hover {
      background-color: #ddd;
      cursor: pointer;
    }
  }
</style>
