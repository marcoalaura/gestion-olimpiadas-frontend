<template>
  <v-card elevation="0">
    <!-- SLOT PARA EL FORMULARIO -->
    <app-dialog :dialog.sync="modalSubirResultados"
      titulo="Subir resultados de exámenes offline"
      @open-dialog="modalSubirResultados = true;"
      @close-dialog="modalSubirResultados = false; !['DIRECTOR'].includes($storage.get('rol').rol) ? idUnidadEducativaDescarga =  null : ''; updateList();"
      :mostrar-acciones="false"
      @accion="subir"
      max-width="700"
      icono="upload"
    >
      <v-card class="pa-2 d-flex flex-column align-center justify-center pl-0 pr-0" elevation="0">
        <v-form
          :key="`offline-${form.id}`"
          ref="form"
          v-model="valid"
          lazy-validation
          style="width: 95%"
        >
          <v-row>
            <v-col cols="12" md="12" xs="12" sm="12" lg="12">
              <v-input-autocomplete
                @value="e => idUnidadEducativaDescarga = e"
                label="Unidad Educativa"
                :init="idUnidadEducativaDescarga"
                v-model="idUnidadEducativaDescarga"
                dense
                @change="selectUE"
                item-value="id"
                :disabled="['DIRECTOR'].includes($storage.get('rol').rol)"
                item-text="nombre"
                placeholder="Buscar unidades educativas..."
                :items="aUnidadesEducativas || []"
                hint="Si no tiene unidades educativas, cierre esta ventana y seleccione un distrito en el filtro principal"
                persistent-hint
                clearable
                :append-icon="ICONS.search"
                v-on:search="searchUnidadesEducativas"
              />
            </v-col>
            <v-col cols="12" md="12" xs="12" sm="12" lg="12" :key="reference">
              <uploader
                v-if="showUpload"
                :options.sync="options"
                :key="reference"
                :fileStatusText="fileStatusText"
                ref="uploader"
                :autoStart="false"
                :attrs="attrs"
                @files-added="handleFileAdd"
                @file-success="handleSuccess"
                @file-removed="handleRemove"
                @file-error="handleError"
                class="mb-3">
                <uploader-unsupport></uploader-unsupport>
                  <v-card elevation="0" class="d-flex flex-column align-center justify-center mb-5" v-if="files > 0">
                    <v-btn color="info" link text style="text-transform: none" @click="allUpload">
                      <v-icon-component icon="outbox" :size="30"></v-icon-component>
                      Subir todos los archivos cargados
                    </v-btn>
                  </v-card>
                  <uploader-drop class="d-flex flex-column align-center jsutify-center">
                    <p>Arraste y suelte aquí el archivo o los archivos que va a subir</p>
                    <section class="border--separator-files"/>
                    <div class="letter">O</div>
                    <uploader-btn>Buscar archivos</uploader-btn>
                  </uploader-drop>
                  <uploader-list></uploader-list>
              </uploader>
              <v-card v-else elevation="0" class="d-flex flex-row align-center justify-center mt-2 mb-4">
                <v-alert
                  text
                  dense
                  type="error"
                  class="fs8"
                >
                  Para subir el archivo por favor seleccione una unidad educativa
                </v-alert>
              </v-card>
            </v-col>
          </v-row>
        </v-form>
      </v-card>
    </app-dialog>

    <app-dialog :dialog.sync="modalDescargarPruebas"
      titulo="Descargar exámenes offline"
      @open-dialog="modalDescargarPruebas = true;"
      @close-dialog="modalDescargarPruebas = false; closeModalDescarga();"
      :opciones-desactivadas="opcionesDesactivadas"
      textoEjecutar="Descargar"
      :mostrar-acciones="false"
      icono="download"
    >
      <v-card
        class="pa-2 d-flex flex-column align-center justify-center pl-0 pr-0"
        elevation="0"
        :key="reference"
      >
        <v-container>
          <v-row>
            <v-col cols="12" md="12" xs="12" sm="12" lg="12">
              <v-input-select
                @value="e => idOlimpiadaDescarga = e"
                color="primary"
                :init="idOlimpiadaDescarga"
                item-color="primary"
                disabled
                label="Olimpiada seleccionada:"
                :items="aOlimpiadas"
                item-value="id"
                item-text="nombre"
                outlined
                attach
                dense
                hide-details
                v-model="idOlimpiadaDescarga"
                :rules="$validate(['required'])"
              >
              </v-input-select>
            </v-col>
            <v-col cols="12" md="12" xs="12" sm="12" lg="12">
              <v-input-select
                @value="e => idEtapaSeleccionada = e"
                color="primary"
                :init="idEtapaSeleccionada"
                item-color="primary"
                disabled
                label="Etapa seleccionada:"
                :items="aEtapas"
                item-value="id"
                item-text="nombre"
                outlined
                attach
                dense
                hide-details
                v-model="idEtapaSeleccionada"
                :rules="$validate(['required'])"
              >
              </v-input-select>
            </v-col>
            <v-col cols="12">
              <v-input-autocomplete
                @value="e => idUnidadEducativaDescarga = e"
                label="Unidad Educativa"
                :init="unidadEducativaSeleccionada"
                v-model="idUnidadEducativaDescarga"
                dense
                :disabled="['DIRECTOR'].includes($storage.get('rol').rol)"
                item-value="id"
                item-text="nombre"
                placeholder="Buscar unidades educativas..."
                :items="aUnidadesEducativas || []"
                hint="Si no tiene unidades educativas, cierre esta ventana y seleccione un distrito en el filtro principal"
                persistent-hint
                clearable
                :append-icon="ICONS.search"
                v-on:search="searchUnidadesEducativas"
              />
            </v-col>

            <v-col cols="12" md="12" xs="12" sm="12" lg="12">
              <v-btn
                class="ma-2"
                :loading="loadingDescarga"
                :disabled="!idOlimpiadaDescarga || !idUnidadEducativaDescarga"
                color="info"
                block
                @click="solicitarDescargarArchivo()"
                v-if="!urlDescargaEmpaquetado"
              >
                {{ descargaExeMsg }}
                <template v-slot:loader>
                  {{ loadingDescargaMsg }}
                  <span class="custom-loader">
                    <v-icon light>cached</v-icon>
                  </span>
                </template>
              </v-btn>
              <v-btn
                class="ma-2"
                outlined
                :disabled="!idOlimpiadaDescarga || !idUnidadEducativaDescarga"
                :href="urlDescargaEmpaquetado"
                download
                v-else>
                  DESCARGAR
                  <v-icon
                    right
                    dark
                  >
                    download
                  </v-icon>
              </v-btn>
            </v-col>
          </v-row>
        </v-container>
      </v-card>
    </app-dialog>
    <crud-table
      v-if="showCrudTable"
      :headers="headers"
      :url.sync="url"
      :show-filter-options="false"
      :widthModal="500"
      :order="order"
      :show-filter-init="true"
      :filters.sync="filters"
      description="Pruebas offline"
      :custom="true"
      :filtro-as-query="false"
      :omitir-carga-on-mounted="true"
      >
      <template slot="buttons">
        <v-tooltip bottom color="primary">
          <template v-slot:activator="{ on }">
            <v-btn icon :small="['xs', 'sm'].includes($vuetify.breakpoint.name)" @click.native="oModalUpload"
              class="primary--text btn-filter" v-on="on">
              <v-icon-component icon="upload" color="primary"/>
            </v-btn>
          </template>
          <span> Subir resultados </span>
        </v-tooltip>
        <v-tooltip bottom color="primary">
          <template v-slot:activator="{ on }">
            <v-btn icon :small="['xs', 'sm'].includes($vuetify.breakpoint.name)" @click.native="oModalDownload"
              class="primary--text btn-filter" v-on="on">
              <v-icon-component icon="download" color="primary"/>
            </v-btn>
          </template>
          <span> Descargar pruebas offline </span>
        </v-tooltip>
      </template>
      <template slot="items" slot-scope="items">
        <tr>
          <td>{{ items.items.inscripcion.unidadEducativa.nombre }}</td>
          <td>{{ items.items.inscripcion.unidadEducativa.codigoSie }}</td>
          <td>
            {{ items.items.inscripcion.estudiante.persona.nombres }}
            {{ items.items.inscripcion.estudiante.persona.primerApellido }}
            {{ items.items.inscripcion.estudiante.persona.segundoApellido }}
          </td>
          <td>{{ items.items.inscripcion.estudiante.rude }}</td>
          <td>{{ items.items.inscripcion.etapaAreaGrado.area.nombre }}</td>
          <td>{{ items.items.inscripcion.etapaAreaGrado.gradoEscolar.nombre }}</td>
          <td>{{ items.items.fechaCargadoOffline ? $datetime.format('DD/MM/YYYY', items.items.fechaCargadoOffline) : '' }}</td>
          <td>
            <v-tooltip bottom color="color1">
              <template v-slot:activator="{ on }">
                <v-btn
                  :ripple="false"
                  plain
                  text
                  class="cursor-normal"
                  color="color1"
                  v-on="on"
                >
                  <strong>{{ items.items.estadoCargadoOffline }}</strong>
                </v-btn>
              </template>
              {{ items.items.estadoCargadoOffline }}
            </v-tooltip>
          </td>
        </tr>
      </template>
    </crud-table>
  </v-card>
</template>
<script>

import { Uploader, UploaderBtn, UploaderDrop, UploaderList, UploaderUnsupport } from 'vue-simple-uploader';
import validate from '@/common/mixins/validate';
import CrudTable from '@/plugins/crud-table/CrudTable.vue';
import actions from '@/plugins/crud-table/mixins/crud-table';
import AppDialog from '@/plugins/modal/AppDialog.vue';
import axios from 'axios';
import vIconComponent from '../../plugins/icon/index.vue';

const GENERACION_EXAMENES = 'GENERACION_EXAMENES';

export default {
  mixins: [actions, validate],
  data: () => ({
    valid: false,
    showCrudTable: null,
    url: 'examenesAdministracion/offline',
    order: ['createdAt', 'DESC'],
    headers: [
      {
        text: 'Unidad Educativa',
        sortable: false,
        align: 'center',
        value: 'unidadEducativa'
      },
      {
        text: 'SIE',
        sortable: false,
        align: 'center',
        value: 'sie'
      },
      {
        text: 'Nombres y apellidos',
        sortable: false,
        align: 'center',
        value: 'nombres'
      },
      {
        text: 'RUDE',
        sortable: false,
        align: 'center',
        value: 'rude'
      },
      {
        text: 'Área',
        divider: false,
        sortable: false,
        align: 'center',
        value: 'area'
      },
      {
        text: 'Año de escolaridad',
        divider: false,
        sortable: false,
        align: 'center',
        value: 'grado'
      },
      {
        text: 'Fecha de carga',
        divider: false,
        sortable: false,
        align: 'center',
        value: 'fechaCargadoOffline'
      },
      {
        text: 'Estado de carga',
        divider: false,
        sortable: false,
        align: 'center',
        value: 'estadoCargadoOffline'
      }
    ],
    form: {
      id: null,
      nombre: null,
      codigo: null,
      idDepartamento: null,
    },
    headersDescarga: [
      {
        text: 'Fecha',
        sortable: false,
        align: 'center',
        value: 'fecha'
      },
      {
        text: 'Estado',
        sortable: false,
        align: 'center',
        value: 'estado'
      },
    ],
    options: {},
    fileStatusText: {},
    attrs: {
      accept: '*'
    },
    idUnidadEducativaDescarga: null,
    btnAgregar: true,
    btnEditar: true,
    btnEliminar: true,
    GENERACION_EXAMENES: GENERACION_EXAMENES,
    departamentos: [],
    modalSubidaArchivo: false,
    modalSubirResultados: false,
    modalDescargarPruebas: false,
    unidadesEducativas: [],
    opcionesDesactivadas: true,
    idUnidadEducativaSubida: null,
    idOlimpiadaDescarga: null,
    mFile: null,
    aOlimpiadas: [],
    loadingDescargaMsg: 'Verificando',
    loadingDescarga: false,
    descargaExeMsg: 'Solicitar archivo .exe',
    urlDescargaEmpaquetado: null,
    refreshIntervalId: null,
    idDescarga: null,
    nombreArchivoEjecutable: null,
    nivelUsuario: [],
    aDepartamentos: [],
    aDistritos: [],
    aEtapas: [],
    customizedFilters: [],
    departamentoSeleccionado: null,
    distritoSeleccionado: null,
    existOlimpiada: null,
    idEtapaSeleccionada: null,
    existUnidadEducativa: null,
    idOlimpiadaSeleccionada: null,
    aUnidadesEducativas: [],
    unidadEducativaSeleccionada: null,
    reference: null,
    filters: [],
    files: 0,
    interval: null,
    showUpload: false
  }),
  destroyed() {
    clearInterval(this.interval);
  },
  mounted() {
    this.$nextTick(async () => {
      // Verificar permiso para crear
      if (this.$Casbin && this.$Casbin.enforcer) {
        const { rol } = this.$storage.get('rol');
        this.btnAgregar = await this.$Casbin.enforcer.enforce(rol, '/distritos', 'create');
        this.btnEditar = await this.$Casbin.enforcer.enforce(rol, '/distritos', 'update');
        this.btnEliminar = await this.$Casbin.enforcer.enforce(rol, '/distritos', 'delete');
      }
      this.interval = setInterval(() => {
        if (this.isTokenExp()) {
          this.updateToken();
        }
      }, 1000);
      if (['DIRECTOR'].includes(this.$storage.get('rol').rol)) this.showUpload = true;
      const nivel = await this.$service.get('usuarios/roles');
      this.nivelUsuario = nivel.datos.nivel;
      const respuesta = await this.$service.get('olimpiadas?limite=50&pagina=1');
      this.aOlimpiadas = respuesta.datos.filas;
      this.idOlimpiadaSeleccionada = this.aOlimpiadas.length > 0 ? this.aOlimpiadas[0].id : null;
      this.$storage.set('olimpiadaSeleccionada', this.aOlimpiadas.length > 0 ? this.aOlimpiadas[0] : null);
      const departamentos = await this.$service.get('departamentos');
      this.aDepartamentos = departamentos.datos;
      this.fileStatusText = (status, response) => {
        const statusTextMap = {
          uploading: 'Subiendo...',
          paused: 'Listo para subir',
          waiting: 'esperando...',
          success: 'Cargado'
        };
        if (status === 'error') {
          return response.mensaje;
        } else {
          return statusTextMap[status];
        }
      };

      if (this.aOlimpiadas.length > 0) {
        await this.loadData(this.nivelUsuario[0]);
      } else {
        this.$storage.set('olimpiadaSeleccionada', null);
        this.$storage.set('etapaSeleccionada', null);
        this.$storage.set('areaSeleccionada', null);
      }

      this.filters = this.definirFiltros();
      this.idUnidadEducativaDescarga = this.unidadEducativaSeleccionada;
      this.options = {
        target: `${this.$baseServer}examenesOffline/pruebas?idUnidadEducativa=${this.unidadEducativaSeleccionada || ''}`,
        method: 'PATCH',
        headers: {
          Authorization: `${this.$authToken} ${this.$storage.get('token')}`
        },
        withCredentials: true,
        uploadMethod: 'PATCH',
        testChunks: false
      };
      this.showCrudTable = true;
      setTimeout(() => {
        this.updateList();
      }, 100);
    });
    this.eliminarSetInterval();
  },
  computed: {
    setDisabled () {
      let state = false;
      if (['DIRECTOR'].includes(this.$storage.get('rol').rol) && this.unidadEducativaSeleccionada) state = true;
      return state;
    },
    formData() {
      const formData = new FormData();
      formData.append('archivo', this.mFile);
      return formData;
    },
    configSubidaArchivo() {
      return {
        method: 'PATCH',
        url: this.$baseServer + (this.$storage.get('rol').rol === 'TECNICO_SIE'
          ? `examenesOffline/unidadEducativa/${this.idUnidadEducativaSubida}/pruebas`
          : 'examenesOffline/pruebas'),
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `${this.$authToken} ${this.$storage.get('token')}`
        },
      };
    }
  },
  methods: {
    isTokenExp () {
      const actualDate = Math.round(new Date().getTime() / 1000);
      const ttl = this.$storage.get('ttl');
      const t = this.$storage.get('t');
      return actualDate - t > ttl;
    },
    getUrl (url, id) {
      id = typeof id === 'string' || typeof id === 'number' ? `${id}` : '';
      if (url && url[url.length - 1] !== '/' && id.length > 1) {
        id = `/${id}`;
      }
      const protocol = window.location.protocol.replace(':', '');
      const PATERN_HOST = protocol === 'https' ? /(https:\/\/|www\.)\S+/i : /(http:\/\/|www\.)\S+/i;
      return PATERN_HOST.test(url) ? url + id : this.$baseServer + url + id;
    },
    getPayload (token) {
      const jwtStr = token.split('.')[1];
      return JSON.parse(atob(jwtStr));
    },
    async updateToken () {
      try {
        const reqToken = axios.create({
          withCredentials: true
        });
        const resp = await reqToken.post(this.getUrl('token'), {});
        const response = resp.data;
        const { datos } = response;
        if (datos?.access_token) {
          this.$storage.set('token', datos.access_token);
          const payload = this.getPayload(datos.access_token);
          const actualDate = Math.round(new Date().getTime() / 1000);
          this.$storage.set('ttl', payload.exp - payload.iat);
          this.$storage.set('t', actualDate);
          this.files = this.$refs.uploader.files.length;
          if (this.$refs.uploader) {
            const { uploader } = this.$refs.uploader;
            uploader.opts.headers = {
              Authorization: `${this.$authToken} ${this.$storage.get('token')}`
            };
          }
        }
      } catch (error) {
        console.error('ocurrio un error', error);
      }
    },
    // eslint-disable-next-line no-unused-vars
    handleSuccess (rootFile, file, response, chunk) {
      const success = JSON.parse(response);
      this.$message.success(success.mensaje);
    },
    handleRemove () {
      this.files = this.$refs.uploader.files.length;
      if (this.isTokenExp()) {
        this.updateToken();
      }
    },
    handleError () {
      const buttons = document.querySelectorAll('.uploader-file-status');
      setTimeout(() => {
        buttons.forEach(item => {
          if (item) {
            item.childNodes[0].style.display = 'none';
            const text = item.childNodes[0].innerText;
            if (!(text.includes('Cargado') || text.includes('Esperando...') || text.includes('Listo para subir'))) {
              const button = document.createElement('button');
              button.innerHTML = 'Ver error...';
              button.className = 'primary--text';
              button.addEventListener('click', () => {
                this.$alert(item.childNodes[0].innerText);
              }, false);
              item.appendChild(button);
            }
          }
        });
      }, 10);
    },
    handleFileAdd () {
      setTimeout(() => {
        this.files = this.$refs.uploader.files.length;
        const { uploader } = this.$refs.uploader;
        uploader.opts.headers = {
          Authorization: `${this.$authToken} ${this.$storage.get('token')}`
        };
      }, 100);
      if (this.isTokenExp()) {
        this.updateToken();
      }
    },
    async allUpload () {
      if (this.isTokenExp()) {
        await this.updateToken();
      }
      this.files = this.$refs.uploader.files.length;
      if (this.files <= 0) {
        this.$message.error('Tiene que buscar archivos para seleccionar todos los archivos a subirse');
        return;
      }
      this.$confirm(`¿Esta seguro de enviar ${this.files === 1 ? 'un archivo' : this.files + ' archivos'}?`, () => {
        this.all = true;
        this.$refs.uploader.uploader.resume();
      }, () => {}, 'SI, ESTOY SEGURO', 'NO');
    },
    selectUE () {
      this.options = {
        ...this.options,
        target: `${this.$baseServer}examenesOffline/pruebas?idUnidadEducativa=${this.idUnidadEducativaDescarga ?? ''}`
      };
      this.showUpload = this.idUnidadEducativaDescarga;
    },
    async loadData (data) {
      const keyNiveles = Object.entries(data);
      this.departamentoSeleccionado = null;
      this.existUnidadEducativa = null;
      this.aUnidadesEducativas = [];
      this.aDistritos = [];
      this.distritoSeleccionado = null;
      for (const [key, value] of keyNiveles) {
        if (key === 'idOlimpiada') this.existOlimpiada = true;
        if (key === 'idDepartamento') this.departamentoSeleccionado = this.aDepartamentos.find(dep => dep.id === value).id;
        if (key === 'idUnidadEducativa') this.existUnidadEducativa = value;
        if (key === 'idDistrito') this.distritoSeleccionado = value;
      }
      if (this.existUnidadEducativa) {
        const unidadEducativaInicial = await this.$service.get(`unidades-educativas/${this.existUnidadEducativa}`);
        this.aUnidadesEducativas = [unidadEducativaInicial.datos];
        this.unidadEducativaSeleccionada = this.existUnidadEducativa;
      }
      await this.cargarEtapas();
      await this.handleChangeDep(this.departamentoSeleccionado ? this.departamentoSeleccionado : this.aDepartamentos[0].id);
      await this.loadUnidadesEducativas(this.distritoSeleccionado);
    },
    async handleChangeEtapa(idEtapaSeleccionadaNueva) {
      this.etapaSeleccionada = this.aEtapas.find(item => item.id === idEtapaSeleccionadaNueva);
      this.idEtapaSeleccionada = idEtapaSeleccionadaNueva;
      this.$storage.set('etapaSeleccionada', this.etapaSeleccionada);
    },
    async handleChangeOlimpiada(idOlimpiadaSeleccionadaNueva) {
      this.olimpiadaSeleccionada = this.aOlimpiadas.find(item => item.id === idOlimpiadaSeleccionadaNueva);
      this.idOlimpiadaSeleccionada = idOlimpiadaSeleccionadaNueva;
      this.$storage.set('olimpiadaSeleccionada', this.olimpiadaSeleccionada);
      const data = await this.searchInNiveles(idOlimpiadaSeleccionadaNueva);
      this.idEtapaSeleccionada = null;
      this.aEtapas = [];
      await this.loadData(data);
      this.filters = this.definirFiltros();
    },
    searchInNiveles (idOlimpiada) {
      return new Promise((resolve, reject) => {
        try {
          const data = this.nivelUsuario.find(item => item.idOlimpiada === idOlimpiada);
          resolve(data);
        } catch (error) {
          reject(error);
        }
      });
    },
    cargarEtapas() {
      return new Promise(async (resolve, reject) => {
        try {
          const resultado = await this.$service.get(`olimpiadas/${this.idOlimpiadaSeleccionada}/etapas`);
          if (resultado && resultado.isOK) {
            this.aEtapas = resultado.datos && resultado.datos.filas ? resultado.datos.filas : [];
            this.idEtapaSeleccionada = this.aEtapas.length > 0 ? this.aEtapas[0].id : null;
            this.$storage.set('etapaSeleccionada', this.aEtapas.length > 0 ? this.aEtapas[0] : null);
          }
          resolve(true);
        } catch (error) {
          reject(error);
        }
      });
    },
    loadDistritos(idDepartamento, str) {
      return new Promise(async (resolve, reject) => {
        try {
          this.departamentoSeleccionado = idDepartamento;
          const searchName = str ? `nombre:${str},` : '';
          const distritos = await this.$service.get(`distritos?filtro=${searchName}idDepartamento:${this.departamentoSeleccionado ? this.departamentoSeleccionado : ''}`);
          this.aDistritos = distritos && distritos.datos && distritos.datos.filas ? distritos.datos.filas : [];
          if (this.aDistritos.length === 0) {
            this.aUnidadesEducativas = [];
            this.unidadEducativaSeleccionada = null;
            this.distritoSeleccionado = null;
          } else {
            // this.distritoSeleccionado = this.distritoSeleccionado ? this.distritoSeleccionado : this.aDistritos.length > 0 ? this.aDistritos[0].id : null;
          }
          resolve(true);
        } catch (error) {
          reject(error);
        }
      });
    },
    async handleChangeDep (idDepartamento) {
      await this.loadDistritos(idDepartamento);
      await this.loadUnidadesEducativas(this.distritoSeleccionado);
      this.filters = this.definirFiltros();
    },
    async handleChangeDis (idDistrito) {
      await this.loadUnidadesEducativas(idDistrito);
      this.filters = this.definirFiltros();
    },
    async searchDistritos (str) {
      await this.loadDistritos(this.departamentoSeleccionado, str);
      this.filters = this.definirFiltros();
    },
    async searchUnidadesEducativas (str) {
      await this.loadUnidadesEducativas(this.distritoSeleccionado, str);
      this.filters = this.definirFiltros();
    },
    loadUnidadesEducativas(idDistrito, str = null) {
      return new Promise(async (resolve, reject) => {
        try {
          this.distritoSeleccionado = idDistrito;
          if (idDistrito && this.aDistritos.length > 0) {
            const searchName = str ? `nombre:${str},` : '';
            const unidadesEducativas = await this.$service.get(`unidades-educativas?filtro=${searchName}idDistrito:${idDistrito ?? ''}`);
            this.aUnidadesEducativas = unidadesEducativas && unidadesEducativas.datos && unidadesEducativas.datos.filas ? unidadesEducativas.datos.filas : [];
            const unidadEducativaSeleccionada = this.aUnidadesEducativas.find(item => item.id === this.unidadEducativaSeleccionada);
            if (unidadEducativaSeleccionada) this.unidadEducativaSeleccionada = unidadEducativaSeleccionada.id;
          } else {
            this.aUnidadesEducativas = [];
            this.unidadEducativaSeleccionada = null;
          }
          resolve(true);
        } catch (error) {
          reject(error);
        }
      });
    },
    definirFiltros() {
      this.customizedFilters = [];
      const { rol } = this.$storage.get('rol');

      if (this.existOlimpiada) {
        this.customizedFilters.push({
          field: 'idOlimpiada',
          type: 'array',
          init: this.$storage.get('olimpiadaSeleccionada') ? this.$storage.get('olimpiadaSeleccionada').id : null,
          multiple: false,
          label: 'Olimpiadas',
          eventName: 'cambioOlimpiadas',
          onChange: this.handleChangeOlimpiada,
          values: this.aOlimpiadas.map(olimpiada => ({
            text: olimpiada.nombre,
            value: olimpiada.id
          })),
        });

        this.customizedFilters.push({
          field: 'idEtapa',
          type: 'array',
          init: this.idEtapaSeleccionada,
          multiple: false,
          label: 'Etapas',
          eventName: 'cambioEtapas',
          onChange: this.handleChangeEtapa,
          values: this.aEtapas.map(etapa => ({
            text: `${etapa.nombre} - ${etapa.estadoDescripcion}`,
            value: etapa.id
          })),
        });
      }

      if (this.departamentoSeleccionado || ['ADMINISTRADOR'].includes(rol)) {
        this.customizedFilters.push({
          field: 'idDepartamento',
          type: 'array',
          multiple: false,
          init: this.departamentoSeleccionado,
          eventName: 'cambioDepartamento',
          onChange: this.handleChangeDep,
          disabled: ['TECNICO_SIE_DEPARTAMENTAL', 'DIRECTOR', 'TECNICO_SIE_DISTRITO'].includes(this.$storage.get('rol').rol),
          label: 'Departamentos',
          values: this.aDepartamentos.map(departamento => ({
            text: departamento.nombre,
            value: departamento.id
          })),
        },
        {
          field: 'idDistrito',
          type: 'autocomplete',
          multiple: false,
          onChange: this.handleChangeDis,
          eventName: 'cambioDistritos',
          eventSearch: 'searchDistritos',
          clear: true,
          disabled: ['DIRECTOR', 'TECNICO_SIE_DISTRITO'].includes(this.$storage.get('rol').rol),
          onAutocomplete: this.searchDistritos,
          init: this.distritoSeleccionado,
          label: 'Distritos',
          values: this.aDistritos.map(departamento => ({
            text: departamento.nombre,
            value: departamento.id
          })),
        });
      }
      if (this.existUnidadEducativa || ['ADMINISTRADOR', 'TECNICO_SIE_DEPARTAMENTAL', 'TECNICO_SIE_DISTRITO'].includes(rol)) {
        this.customizedFilters.push({
          field: 'idUnidadEducativa',
          type: 'autocomplete',
          init: this.unidadEducativaSeleccionada,
          multiple: false,
          clear: true,
          eventName: 'cambioUnidadEducativa',
          onChange: this.handelChangeUnidadEducativa,
          eventSearch: 'searchUnidadEducativa',
          onAutocomplete: this.searchUnidadesEducativas,
          disabled: this.$storage.get('rol').rol === 'DIRECTOR',
          label: 'Unidad Educativa',
          values: this.aUnidadesEducativas.map(olimpiada => ({
            text: olimpiada.nombre,
            value: olimpiada.id
          })),
        });
      }
      return this.customizedFilters;
    },
    async activar(item) {
      const message = `¿Está seguro de activar ${item.nombre}?`;
      this.$confirm(
        message,
        async () => {
          const response = await this.$service.patch(`${this.url}/activacion/${item.id}`, {});
          if (response.isOK) {
            this.$message.success(response.mensaje);
          } else {
            this.$message.error(response.mensaje ?? response.message ?? `Error al activar ${item.nombre}`);
          }
          this.closeModal();
          this.updateList();
        }
      );
    },
    async inactivar(item) {
      const message = `¿Está seguro de inactivar ${item.nombre}?`;
      this.$confirm(
        message,
        async () => {
          try {
            const response = await this.$service.patch(`${this.url}/inactivacion/${item.id}`, {});
            this.$message.success(response.mensaje);
          } catch (error) {
            this.$message.error(error.mensaje ?? error.message ?? `Error al inactivar ${item.nombre}`);
          } finally {
            this.closeModal();
            this.updateList();
          }
        }
      );
    },
    reset() {
      this.form = {
        id: null,
        nombre: null,
        codigo: null,
        idDepartamento: null,
      };
      this.opcionesDesactivadas = true;
      this.unidadesEducativas = [];
      this.mFile = null;
      this.idUnidadEducativaSubida = null;
      this.idOlimpiadaDescarga = null;
      if (!['DIRECTOR'].includes(this.$storage.get('rol').rol)) this.idUnidadEducativaDescarga = null;
      this.unidadesEducativas = [];
      this.loadingDescargaMsg = 'Verificando';
      this.loadingDescarga = false;
      this.descargaExeMsg = 'Solicitar archivo .exe';
      this.urlDescargaEmpaquetado = null;
      this.eliminarSetInterval();
      this.refreshIntervalId = null;
      this.idDescarga = null;
      if (!['DIRECTOR'].includes(this.$storage.get('rol').rol)) this.showUpload = false;
    },

    closeModal() {
      this.modalSubidaArchivo = false;
      this.reset();
    },
    closeModalDescarga() {
      this.modalDescargarPruebas = false;
      this.reset();
    },
    async oModal({ items }) {
      if (items && items.id) {
        this.form = { ...items };
        this.form.idDepartamento = items.departamento.id;
      } else {
        this.reset();
      }
      this.modalSubidaArchivo = true;
    },
    async oModalUpload() {
      this.reference = (Math.random() * 50) + 1;
      this.modalSubirResultados = true;
      this.reset();
      await this.loadUnidadesEducativas(this.distritoSeleccionado);
      if (this.unidadEducativaSeleccionada && this.existUnidadEducativa) {
        const aUnidadEducativa = this.aUnidadesEducativas.find(unidadEducativa => unidadEducativa.id === this.unidadEducativaSeleccionada);
        this.aUnidadesEducativas = [aUnidadEducativa];
      }
    },
    async oModalDownload() {
      if (!this.distritoSeleccionado) {
        this.$message.error('Debe seleccionar un distrito educativo');
        return;
      }
      this.reference = (Math.random() * 50) + 1;
      this.modalDescargarPruebas = true;
      this.reset();
      await this.loadUnidadesEducativas(this.distritoSeleccionado);
      if (this.unidadEducativaSeleccionada && this.existUnidadEducativa) {
        const aUnidadEducativa = this.aUnidadesEducativas.find(unidadEducativa => unidadEducativa.id === this.unidadEducativaSeleccionada);
        this.aUnidadesEducativas = [aUnidadEducativa];
      }
      this.idOlimpiadaDescarga = this.$storage.get('olimpiadaSeleccionada').id;
    },
    selectFile() {
      this.msgError = null;
    },
    async subir() {
      if (this.$refs.form.validate()) {
        const response = await this.$service.requestWithConfig(this.configSubidaArchivo);
        if (response.isOK) {
          this.$message.success('El archivo subido correctamente');
          this.modalSubirResultados = false;
          this.closeModal();
          this.reset();
        }
      } else {
        this.$message.error('Complete los campos obligatorios');
      }
    },
    async descargarPruebaOffline(idArchivoDescarga) {
      const response = await this.$service.post(`examenesOffline/olimpiada/${this.idOlimpiadaDescarga}/unidadEducativa/${this.idUnidadEducativaDescarga}/empaquetados/${idArchivoDescarga}`);
      if (response.finalizado) {
        this.closeModal();
        this.reset();
      } else {
        this.$message.error(response.mensaje || 'Complete los campos obligatorios');
      }
    },
    async solicitarDescargarArchivo() {
      try {
        if (!this.idUnidadEducativaDescarga || !this.idOlimpiadaDescarga) {
          this.$message.error('Faltan algunos campos por completar para iniciar la descarga');
          return;
        }
        this.loadingDescarga = true;
        this.loadingDescargaMsg = 'Generando archivo';
        const urlListadoYCreacion = `examenesOffline/olimpiada/${this.idOlimpiadaDescarga}/etapa/${this.idEtapaSeleccionada}/unidadEducativa/${this.idUnidadEducativaDescarga}/empaquetados`;
        const response = await this.$service.get(urlListadoYCreacion);
        if (response.datos && response.datos.total === 0) {
          const responseGeneracion = await this.$service.post(urlListadoYCreacion);
          if (responseGeneracion.finalizado && responseGeneracion.datos && ['PROCESANDO', 'CREADO'].includes(responseGeneracion.datos.estado)) {
            this.idDescarga = responseGeneracion.datos.id;
            this.configurarSetIntervalUrlDescarga(urlListadoYCreacion);
          } else {
            this.loadingDescarga = false;
            this.$message.error(responseGeneracion.mensaje ? `Error: ${responseGeneracion.mensaje}` : 'Error: No se puede generar');
          }
        } else if (response.finalizado && response.datos && response.datos.filas && response.datos.filas.length > 0) {
          this.idDescarga = response.datos.filas[0].id;
          if (response.datos.filas[0].estado === 'FINALIZADO') {
            this.obtenerUrlDescarga();
            this.eliminarSetInterval();
          } else if (response.datos.filas[0].estado === 'PROCESANDO') {
            this.configurarSetIntervalUrlDescarga(urlListadoYCreacion);
          }
        } else {
          this.loadingDescarga = false;
          this.$message.warning('La respuesta no es válida, intente mas tarde');
        }
      } catch (error) {
        this.loadingDescarga = false;
      }
    },
    async configurarSetIntervalUrlDescarga() {
      const refreshIntervalId = setInterval(async () => {
        this.obtenerUrlDescarga();
      }, 10000);
      this.$store.commit('setIdSetInterval', refreshIntervalId);
    },
    async obtenerUrlDescarga() {
      const urlDescarga = `examenesOffline/olimpiada/${this.idOlimpiadaDescarga}/etapa/${this.idEtapaSeleccionada}/unidadEducativa/${this.idUnidadEducativaDescarga}/empaquetados/${this.idDescarga}`;
      const response = await this.$service.get(urlDescarga);
      if (response.datos.estado === 'FINALIZADO') {
        this.descargarEmpaquetado();
        return;
      }
      if (response.datos.estado !== 'PROCESANDO') {
        this.$message.error(response.mensaje || 'Ocurrió un error al obtener el archivo de descarga');
        this.eliminarSetInterval();
        this.closeModalDescarga();
      }
    },
    eliminarSetInterval() {
      if (this.$store.state.idSetInterval) {
        clearInterval(this.$store.state.idSetInterval);
        this.$store.commit('setIdSetInterval', null);
      }
    },
    async descargarEmpaquetado() {
      this.loadingDescargaMsg = 'Descargando archivo .exe';
      const urlDescarga = `${this.$baseServer}examenesOffline/olimpiada/${this.idOlimpiadaDescarga}/etapa/${this.idEtapaSeleccionada}/unidadEducativa/${this.idUnidadEducativaDescarga}/empaquetados/${this.idDescarga}`;
      const unidadEducativa = this.aUnidadesEducativas.find(item => item.id === this.idUnidadEducativaDescarga);
      const nombreArchivoDescargado = `${unidadEducativa.nombre}_${unidadEducativa.id}`;
      await this.$service.file(urlDescarga, 'exe', true, false, 'POST', null, nombreArchivoDescargado);
      this.closeModalDescarga();
    }
  },
  watch: {
    'idUnidadEducativaDescarga'(newValue) {
      if (newValue && this.idOlimpiadaDescarga) {
        this.opcionesDesactivadas = false;
        for (const unidadEducativa of this.unidadesEducativas) {
          if (unidadEducativa.id === newValue) {
            this.nombreArchivoEjecutable = `${unidadEducativa.nombre}_${unidadEducativa.id}.exe`;
            break;
          }
        }
      }
    },
    'idOlimpiadaDescarga'(newValue) {
      if (newValue && this.idUnidadEducativaDescarga) {
        this.opcionesDesactivadas = false;
      }
    },
    'form.fechaInicio'(newValue) {
      this.minFechaFin = newValue;
    },
    'form.fechaFin'(newValue) {
      this.maxFechaInicio = newValue;
    },
    'urlDescargaEmpaquetado'(newValue) {
      if (newValue === true) {
        if (this.$store.state.idSetInterval) {
          clearInterval(this.$store.state.idSetInterval);
          this.$store.commit('setIdSetInterval', null);
        }
      }
    }
  },
  components: {
    CrudTable,
    AppDialog,
    Uploader,
    UploaderBtn,
    UploaderDrop,
    UploaderList,
    UploaderUnsupport,
    vIconComponent,
  }
};
</script>
<style lang="scss">
  @import '../../scss/variables.scss';
  .custom-loader {
    animation: loader 1s infinite;
    display: flex;
    margin: 8px;
  }
  .theme--dark .uploader {
    [status=error] {
      background: #ffe0e0 !important;
      .uploader-file-info {
        color: $fontColor;
      }
    }
    [status=success] .uploader-file-progress {
      background: #e3f8de !important;
      .uploader-file-info {
        color: $fontColor;
      }
    }
    [status=paused] {
      background: transparent !important;
      .uploader-file-info {
        color: $fontColor;
      }
    }
  }
  .theme--light .uploader {
    [status=error] {
      background: #ffe0e0 !important;
      .uploader-file-info {
        color: $fontColor;
      }
    }
    [status=success] .uploader-file-progress {
      background: #e3f8de !important;
      .uploader-file-info {
        color: $fontColor;
      }
    }
    [status=paused] {
      background: transparent !important;
      .uploader-file-info {
        color: $fontColor;
      }
    }
  }
  .uploader {
    width: 100%;
    .uploader-drop {
      background: transparent;
    }
    .uploader-btn {
      color: $fontColor;
    }
    .uploader-list ul li{
      color: $black;
    }
  }
  .border--separator-files {
    width: 73%;
    margin: auto;
    border-bottom: 1px solid $fontColor;
    margin-bottom: 20px;
    opacity: .2;
  }
  .letter {
    width: 20px;
    background: $backgroundColor;
    user-select: none;
    opacity: .2;
    margin-top: -30px;
  }
  @-moz-keyframes loader {
    from {
      transform: rotate(0);
    }
    to {
      transform: rotate(360deg);
    }
  }
  @-webkit-keyframes loader {
    from {
      transform: rotate(0);
    }
    to {
      transform: rotate(360deg);
    }
  }
  @-o-keyframes loader {
    from {
      transform: rotate(0);
    }
    to {
      transform: rotate(360deg);
    }
  }
  @keyframes loader {
    from {
      transform: rotate(0);
    }
    to {
      transform: rotate(360deg);
    }
  }
</style>
