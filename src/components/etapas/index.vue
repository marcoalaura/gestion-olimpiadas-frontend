<template>
  <v-card elevation="0">
    <Informacion
      :dialog="dialogInformacion"
      :estado="estadoInformacion"
    />
    <v-dialog v-model="modalCalificacion" persistent width="400">
      <v-card>
        <v-card-title>
          <v-btn icon class="primary--text btn-filter">
            <v-icon-component icon="info" color="primary"/>
          </v-btn>
          Confirmación
        </v-card-title>
        <v-card-text>
          <p>
          Se calificarán los exámenes. Este proceso puede demorar dependiendo de la cantidad de exámenes generados.
          </p>
          <v-simple-table dense v-if="itemCalificacion">
            <template v-slot:default>
              <thead>
                <tr>
                  <th class="text-left">
                    Detalles etapa
                  </th>
                  <th class="text-left">
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td> Nombre </td>
                  <td>{{ itemCalificacion.nombre }}</td>
                </tr>
                <tr>
                  <td> Tipo</td>
                  <td>{{ itemCalificacion.tipo }}</td>
                </tr>
                <tr>
                  <td> Fecha inicio </td>
                  <td>{{ itemCalificacion.fechaInicio }}</td>
                </tr>
                <tr>
                  <td> Fecha fin </td>
                  <td>{{ itemCalificacion.fechaFin }}</td>
                </tr>
                <!-- <tr>
                  <td> <i> Nombre olimpiada </i></td>
                  <td>{{ itemCalificacion.nombre }}</td>
                </tr> -->
              </tbody>
            </template>
          </v-simple-table>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            elevation="0"
            @click="modalCalificacion = false"
          >
            Cancelar
          </v-btn>
          <v-btn
            dark color="primary"
            @click="calificarExamenes()"
            elevation="0"
          >
            Calificar pruebas
            <v-icon
              right
              dark
            >
              rule
            </v-icon>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- SLOT PARA EL FORMULARIO -->
    <app-dialog
      :dialog.sync="modalEtapa"
      :titulo="form.id ? 'Editar etapa' : 'Adicionar etapa'"
      @open-dialog="modalEtapa = true"
      @close-dialog="modalEtapa = false"
      @accion="save"
      :wait="wait"
    >
      <template v-if="modalEtapa">
        <!-- FORMULARIO PARA AGREGAR O EDITAR -->
        <v-form
          :key="`etapa-${form.id}`"
          ref="form"
          v-model="valid"
          lazy-validation
          @submit.prevent="save"
        >
          <v-card elevation="0">
            <v-container fluid>
              <v-row>
                <v-col>
                  <v-input-text-field
                    class="pa-3"
                    label="Olimpiadas"
                    :width="300"
                    dense
                  >
                    <template slot="contenido">
                      <v-select
                        color="primary"
                        required
                        readonly
                        item-color="primary"
                        v-model="form.idOlimpiada"
                        :items="olimpiadas"
                        item-text="nombre"
                        item-value="id"
                        outlined
                        dense
                        @change="
                          actualizarFechaLimiteOlimpiada(form.idOlimpiada)
                        "
                        hide-details
                        :rules="$validate(['required'])"
                      ></v-select>
                    </template>
                  </v-input-text-field>
                </v-col>
              </v-row>
              <v-row>
                <v-col
                  v-if="
                    form.idOlimpiada != null && form.minFechaOlimpiada != null
                  "
                >
                  <span class="font-weight-medium grey--text pa-4">
                    Del <strong>{{ this.form.minFechaOlimpiada }}</strong> al
                    <strong>{{ this.form.maxFechaOlimpiada }}</strong>
                  </span>
                </v-col>
              </v-row>
              <v-row>
                <v-col>
                  <v-col cols="12" md="12" xs="12" sm="12" lg="12">
                    <v-input-text-field
                      @value="(e) => (form.nombre = e)"
                      :init="form.nombre"
                      v-model="form.nombre"
                      label="Nombre de la etapa"
                      required
                      full-width
                      :clearable="false"
                      dense
                      :rules="$validate(['required', 'alfanumerico'])"
                    />
                  </v-col>
                </v-col>
              </v-row>
              <v-row class="ml-2 mr-2">
                <v-col cols="12" md="6" xs="6" sm="6" lg="6">
                  <v-input-text-field label="Tipo de etapa" dense>
                    <template slot="contenido">
                      <v-select
                        :disabled="form.idOlimpiada == null"
                        v-model="form.tipo"
                        :items="enumtipoEtapa"
                        :rules="$validate(['required'])"
                        outlined
                        dense
                        hide-details
                      ></v-select>
                    </template>
                  </v-input-text-field>
                </v-col>
                <v-col cols="12" md="6" xs="6" sm="6" lg="6">
                  <v-switch
                    inset
                    :disabled="form.idOlimpiada == null"
                    v-model="form.comiteDesempate"
                    label="Comité de desempate"
                  ></v-switch>
                </v-col>
              </v-row>
              <v-row class="ml-2 mr-2" v-if="modalEtapa">
                <v-col cols="12" lg="6" md="6" sm="12" xs="12">
                  <v-input-text-field label="Fecha Inicio">
                    <template slot="contenido">
                      <date-input
                        :disabled="form.idOlimpiada == null"
                        :fecha.sync="form.fechaInicio"
                        :tabIndex="5"
                        :min-date="form.minFechaOlimpiada"
                        :max-date="form.maxFechaOlimpiada"
                        required
                        :readonly="form.id != null"
                        formatValidate="DD-MM-YYYY"
                        @value="obtenerFechaInicio"
                      ></date-input>
                    </template>
                  </v-input-text-field>
                </v-col>
                <v-col cols="12" lg="6" md="6" sm="12" xs="12">
                  <v-input-text-field label="Fecha Fin">
                    <template slot="contenido">
                      <date-input
                        :disabled="form.idOlimpiada == null"
                        :fecha.sync="form.fechaFin"
                        :tabIndex="5"
                        formatValidate="DD-MM-YYYY"
                        :min-date="
                          this.formatFechaValidar(
                            form.fechaInicio,
                            'DD-MM-YYYY',
                            'YYYY-MM-DD'
                          )
                        "
                        :max-date="
                          this.formatFechaValidar(
                            form.maxFechaOlimpiada,
                            'DD-MM-YYYY',
                            'YYYY-MM-DD'
                          )
                        "
                        required
                        :readonly="form.id != null"
                        @value="obtenerFechaFin"
                      ></date-input>
                    </template>
                  </v-input-text-field>
                </v-col>
                <!-- <v-col cols="12" lg="6" md="6" sm="12" xs="12">
                  <v-input-text-field label="Fecha Inicio Impugnación">
                    <template slot="contenido">
                      <date-input
                        :fecha.sync="form.fechaInicioImpugnacion"
                        :tabIndex="5"
                        :disabled="form.fechaFin == null"
                        formatValidate="DD-MM-YYYY"
                        :min-date="
                          this.formatFechaValidar(
                            form.fechaFin,
                            'DD-MM-YYYY',
                            'YYYY-MM-DD'
                          )
                        "
                        :max-date="
                          this.formatFechaValidar(
                            form.maxFechaOlimpiada,
                            'DD-MM-YYYY',
                            'YYYY-MM-DD'
                          )
                        "
                        required
                        :readonly="form.id != null"
                        @value="obtenerFechaInicioImpugnacion"
                      ></date-input>
                    </template>
                  </v-input-text-field>
                </v-col>
                <v-col cols="12" lg="6" md="6" sm="12" xs="12">
                  <v-input-text-field label="Fecha Fin Impugnación">
                    <template slot="contenido">
                      <date-input
                        :fecha.sync="form.fechaFinImpugnacion"
                        :tabIndex="5"
                        :disabled="form.fechaInicioImpugnacion == null"
                        formatValidate="DD-MM-YYYY"
                        :min-date="
                          this.formatFechaValidar(
                            form.fechaInicioImpugnacion,
                            'DD-MM-YYYY',
                            'YYYY-MM-DD'
                          )
                        "
                        :max-date="
                          this.formatFechaValidar(
                            form.maxFechaOlimpiada,
                            'DD-MM-YYYY',
                            'YYYY-MM-DD'
                          )
                        "
                        required
                        :readonly="form.id != null"
                        @value="obtenerFechaFinImpugnacion"
                      ></date-input>
                    </template>
                  </v-input-text-field>
                </v-col> -->
              </v-row>
            </v-container>
          </v-card>
        </v-form>
      </template>
    </app-dialog>
    <crud-table
      v-if="showCrudTable"
      description="Etapas"
      :headers="headers"
      :filters.sync="filters"
      :url.sync="url"
      :widthModal="500"
      :show-filter-init="true"
      :order="order"
      :custom="true"
      :show-filter-options="false"
      :omitir-carga-on-mounted="true"
    >
      <template slot="buttons">
        <v-icon-tooltip
          id="addStage"
          color="primary"
          icon="add"
          text="Agregar etapa"
          v-if="btnAgregar && olimpiadas.length > 0"
          @accion="oModal({})"
        />
      </template>

      <template slot="items" slot-scope="items">
        <tr
          v-if="items.items.id === idSelected"
          :style="
            $vuetify.theme.dark ? 'background: #00516D' : 'background: #dbe9f5'
          "
        >
          <td
            colspan="11"
            class="pa-0 ma-0"
            style="
              height: 30px !important;
              min-height: 30px !important;
              border-bottom: none;
            "
          >
            <v-alert text width="100%" dense elevation="0" color="info">
              <v-card
                elevation="0"
                color="transparent"
                class="fs8 primary--text pt-1 pb-1"
                >Esta etapa se encuentra seleccionada para crear o seleccionar
                áreas
              </v-card>
            </v-alert>
          </td>
        </tr>
        <tr
          :class="
            items.items.id === idSelected
              ? `${
                  $vuetify.theme.dark ? 'dark-is-selected' : 'light-is-selected'
                }`
              : ''
          "
        >
          <td>{{ items.items.nombre }}</td>
          <td>
            <v-icon-tooltip color="color1" icon="flag" text="Tipo de etapa" />
            {{ items.items.tipo }}<br />
            <v-icon-tooltip
              :color="items.items.comiteDesempate ? 'success' : 'error'"
              :icon="items.items.comiteDesempate ? 'check_circle' : 'cancel'"
              :text="
                items.items.comiteDesempate
                  ? 'Habra un comité de desempate'
                  : 'No habra un comité de desempate'
              "
              v-if="btnEditar"
            />
            Comité Desempate<br />
          </td>
          <td>
            <v-icon-tooltip color="color1" icon="event" text="Periodo" />
            {{ formatFecha(items.items.fechaInicio) }} -
            {{ formatFecha(items.items.fechaFin) }}<br />
            <!-- <v-icon-tooltip
              color="color1"
              icon="event"
              text="Periodo inpugnación"
            />
            {{ formatFecha(items.items.fechaInicioImpugnacion) }} -
            {{ formatFecha(items.items.fechaFinImpugnacion) }} -->
          </td>
          <td>
            <v-tooltip bottom color="primary">
              <template v-slot:activator="{ on }">
                <v-btn
                  :ripple="false"
                  plain
                  text
                  class="cursor-normal"
                  color="primary"
                  v-on="on"
                >
                  <v-card
                    max-width="199px"
                    elevation="0"
                    color="transparent"
                    class="text-left primary--text"
                  >
                    <strong>
                      {{ items.items.estadoDescripcion }}
                      {{
                        items.items.estado === ESTADO_SORTEO_PREGUNTAS
                          ? `(${items.items.estadoSorteoPreguntas})`
                          : null
                      }}
                      {{
                        items.items.estado === ESTADO_SORTEO_PREGUNTAS_REZAGADOS
                          ? `(${items.items.estadoSorteoPreguntasRezagados})`
                          : null
                      }}
                    </strong>
                  </v-card>
                </v-btn>
              </template>
              {{ descripcionEstado(items.items, false).descripcionCorta }}
            </v-tooltip>
          </td>
          <td>
            <v-tooltip bottom color="color1">
              <template v-slot:activator="{ on }">
                <v-btn
                  outlined
                  color="primary"
                  v-on="on"
                  :loading="enProceso && idProceso === items.items.id"
                  :disabled="items.items.estado === ESTADO_CERRADO || enProceso"
                  v-if="btnEditar && items.items.estado != ESTADO_CERRADO"
                  @click="actualizarEstado(items)"
                  class="no-uppercase"
                  max-width="180px"
                  >
                  <v-card
                    max-width="176px"
                    elevation="0"
                    color="transparent"
                    class="primary--text"
                  >
                    {{ descripcionEstado(items.items, true).nombre }}
                  </v-card>
                </v-btn>
              </template>
              {{ descripcionEstado(items.items, true).descripcionCorta }}
            </v-tooltip>
          </td>
          <td>
            <v-icon-tooltip
              color="primary"
              icon="info"
              text="Información"
              @accion="verInformacion(items)"
            />

            <v-icon-tooltip
              color="success"
              icon="edit"
              text="Editar registro"
              v-if="btnEditar && items.items.estado === ESTADO_ACTIVO && items.items.olimpiada.estado === ESTADO_ACTIVO"
              :disabled="enProceso"
              @accion="oModal(items)"
            />

            <v-icon-tooltip
              color="error"
              icon="delete"
              text="Eliminar registro"
              v-if="btnEliminar && items.items.estado === ESTADO_ACTIVO && items.items.olimpiada.estado === ESTADO_ACTIVO"
              :disabled="enProceso"
              @accion="itemDelete(items)"
            />
          </td>
        </tr>
      </template>
    </crud-table>
    <v-card elevation="0" class="progress--status" v-if="message">
      <v-card
        elevation="0"
        class="cards fs8"
        :class="$vuetify.theme.dark ? 'black--text' : 'white--text'"
      >
        <v-icon-component icon="local_shipping" :size="45"></v-icon-component>
        <v-icon-component icon="done" :size="25"></v-icon-component>
        Se cambio al estado satisfactoriamente
      </v-card>
      <v-card elevation="0" class="cards fs8 info--text">
        <v-progress-circular indeterminate class="mr-3" color="info" />
        Este proceso puede durar varios minutos, revise el estado del registro
        para verificar si finalizo con exito
      </v-card>
    </v-card>
    <v-dialog v-model="$store.state.modal5" persistent :width="1200">
      <Reporte :iTmp="iTmp" @updateEtapa="changeEtapa" nextStep :key="Math.random() * 1000"/>
    </v-dialog>
  </v-card>
</template>
<script>
import validate from '@/common/mixins/validate';
import CrudTable from '@/plugins/crud-table/CrudTable.vue';
import actions from '@/plugins/crud-table/mixins/crud-table';
import DateInput from '@/plugins/date-input/DateInput.vue';
import moment from 'dayjs';

import vIconComponent from '@/plugins/icon/index.vue';
import Auth from '@/components/auth/mixins/auth';
import estados from '@/common/estados.json';
import Informacion from './informacion.vue';

import Reporte from './Reporte.vue';

const ESTADO_PUBLICACION_RESPUESTAS = 'PUBLICACION_RESPUESTAS';
const ESTADO_CLASIFICACION = 'GENERAR_CLASIFICADOS';
const ESTADO_OBTENCION_MEDALLERO = 'OBTENCION_MEDALLERO';
const ESTADO_OBTENCION_MEDALLERO_ERROR = 'OBTENCION_MEDALLERO_ERROR';
const ESTADO_OBTENCION_MEDALLERO_PROCESO = 'OBTENCION_MEDALLERO_PROCESO';
const ESTADO_SORTEO_PREGUNTAS = 'SORTEO_PREGUNTAS';
const ESTADO_SORTEO_PREGUNTAS_REZAGADOS = 'SORTEO_PREGUNTAS_REZAGADOS';
const ESTADO_CERRADO = 'CERRADO';
const ESTADO_ACTIVO = 'ACTIVO';
const ESTADO_CALIFICACION_ERROR = 'CALIFICACION_ERROR';
const ESTADO_CALIFICACION = 'CALIFICACION';
const ESTADO_PENDIENTE = 'PENDIENTE';
const ESTADO_CLASIFICACI0N_ERROR = 'CLASIFICACI0N_ERROR';
const ESTADO_EN_PROCESO = 'EN_PROCESO';
const ESTADO_CLASIFICACION_PROCESO = 'CLASIFICACION_PROCESO';
const ESTADO_CALIFICACION_PROCESO = 'CALIFICACION_PROCESO';

export default {
  mixins: [actions, validate, Auth],
  data: () => ({
    estados: estados,
    dialogInformacion: false,
    estadoInformacion: null,
    valid: false,
    url: null,
    iTmp: null,
    wait: false,
    parametros: null,
    order: ['createdAt', 'DESC'],
    headers: [
      {
        text: 'Nombre',
        sortable: false,
        align: 'center',
        value: 'nombre',
      },
      {
        text: 'Información',
        sortable: false,
        align: 'center',
        value: 'tipo',
      },
      {
        text: 'Periodos',
        sortable: false,
        align: 'center',
        value: 'fechaInicio',
      },
      {
        text: 'Estado Actual',
        sortable: false,
        align: 'center',
        value: 'estadoActual',
      },
      {
        text: 'Siguiente Acción',
        sortable: false,
        align: 'center',
        value: 'estadoSiguiente',
      },
      {
        text: 'Acciones por registro',
        divider: false,
        sortable: false,
        align: 'center',
        value: 'ACTIONS',
      },
    ],
    form: {
      id: null,
      nombre: null,
      comiteDesempate: false,
      tipo: null,
      fechaInicio: null,
      minFechaOlimpiada: null,
      maxFechaOlimpiada: null,
      fechaFin: null,
      fechaInicioImpugnacion: null,
      fechaFinImpugnacion: null,
      idOlimpiada: null,
    },
    ESTADO_CLASIFICACION: ESTADO_CLASIFICACION,
    ESTADO_CERRADO: ESTADO_CERRADO,
    ESTADO_ACTIVO: ESTADO_ACTIVO,
    ESTADO_OBTENCION_MEDALLERO: ESTADO_OBTENCION_MEDALLERO,
    ESTADO_OBTENCION_MEDALLERO_ERROR: ESTADO_OBTENCION_MEDALLERO_ERROR,
    ESTADO_SORTEO_PREGUNTAS: ESTADO_SORTEO_PREGUNTAS,
    ESTADO_SORTEO_PREGUNTAS_REZAGADOS: ESTADO_SORTEO_PREGUNTAS_REZAGADOS,
    ESTADO_CALIFICACION_ERROR: ESTADO_CALIFICACION_ERROR,
    ESTADO_CALIFICACION: ESTADO_CALIFICACION,
    ESTADO_PENDIENTE: ESTADO_PENDIENTE,
    ESTADO_CLASIFICACI0N_ERROR: ESTADO_CLASIFICACI0N_ERROR,
    ESTADO_EN_PROCESO: ESTADO_EN_PROCESO,
    ESTADO_OBTENCION_MEDALLERO_PROCESO: ESTADO_OBTENCION_MEDALLERO_PROCESO,
    ESTADO_CLASIFICACION_PROCESO: ESTADO_CLASIFICACION_PROCESO,
    ESTADO_CALIFICACION_PROCESO: ESTADO_CALIFICACION_PROCESO,
    ESTADO_PUBLICACION_RESPUESTAS,
    filters: [],
    message: null,
    idOlimpiadaSeleccionada: null,
    enumtipoEtapa: ['DISTRITAL', 'DEPARTAMENTAL', 'NACIONAL'],
    btnAgregar: true,
    btnEditar: true,
    btnEliminar: true,
    btnGenerarMedallero: false,
    menufechaInicio: false,
    menufechaFin: false,
    menufechaInicioImpugnacion: false,
    menufechaFinImpugnacion: false,
    olimpiadas: [],
    modalEtapa: false,
    modalCalificacion: false,
    itemCalificacion: null,
    idSelected: null,
    olimpiadaSeleccionada: null,
    showCrudTable: false,
    enProceso: false,
    idProceso: null,
    etapas: []
  }),
  async mounted() {
    // Verificar permiso para crear
    if (this.$Casbin && this.$Casbin.enforcer) {
      const { rol } = this.$storage.get('rol');
      this.btnAgregar = await this.$Casbin.enforcer.enforce(rol, '/etapas', 'create');
      this.btnEditar = await this.$Casbin.enforcer.enforce(rol, '/etapas', 'update');
      this.btnEliminar = await this.$Casbin.enforcer.enforce(rol, '/etapas', 'delete');
      this.btnGenerarMedallero = await this.$Casbin.enforcer.enforce(rol, '/medalleros-generar', 'generate');
    }

    this.olimpiadaSeleccionada = this.$storage.get('olimpiadaSeleccionada');
    if (this.olimpiadaSeleccionada !== null) {
      this.idOlimpiadaSeleccionada = this.olimpiadaSeleccionada.id;
    }

    this.url = this.obtenerRuta();
    this.urlAcciones = 'etapas';

    await this.loadParams();
  },
  methods: {
    showReporteEstudiantesQueDieronLaPrueba () {
      this.$store.commit('openModal', 5);
    },
    async changeEtapa (data) {
      await this.updateEtapa(data);
    },
    handleClickClasificarEtapa(items) {
      const message = `¿Está seguro de generar la clasificación de la etapa <strong>${items.nombre}</strong>?`;
      this.$confirm(
        message,
        async () => {
          this.enProceso = true;
          const response = await this.$service.patch(
            `clasificados/etapa/${items.id}`,
            {}
          );
          if (response.isOK) {
            this.$message.success(response.mensaje);
            this.loadParams();
          } else {
            this.$message.error(
              response.message
                ?? response.mensaje
                ?? 'Error al generar clasificados'
            );
          }
        },
        () => {},
        'SI, ESTOY SEGURO',
        'NO'
      );
    },
    obtenerRuta() {
      return `olimpiadas/${this.idOlimpiadaSeleccionada}/etapas`;
    },
    cerrarPreguntas(id) {
      return new Promise(async (resolve, reject) => {
        try {
          const url = `etapa/${id}/preguntas/resumenEstados`;
          const data = await this.$service.get(url);
          resolve(data.datos);
        } catch (error) {
          reject(error);
        }
      });
    },
    async cargarEtapas() {
      try {
        if (this.idOlimpiadaSeleccionada) {
          const resultado = await this.$service.get(`olimpiadas/${this.idOlimpiadaSeleccionada}/etapas`);
          if (resultado && resultado.isOK) {
            this.etapas = resultado && resultado.datos && resultado.datos.filas
              ? resultado.datos.filas
              : [];
          }
        } else {
          this.etapas = [];
        }
      } catch (error) {
        this.$message.error(error.message);
      }
    },
    generateResume(data) {
      return new Promise(async (resolve, reject) => {
        try {
          let html = `
            <table class='table--resume'>
              <tr>
                <td class='title'>Etapa</td>
                <td class='title'>Area</td>
                <td class='title'>Grado Escolar</td>
                <td class='title'>Estado</td>
                <td class='title'>Cantidad</td>
              </tr>
          `;
          data.filter((item) => {
            html += `<tr><td>${item.etapa}</td>`;
            html += `<td>${item.area}</td>`;
            html += `<td>${item.gradoEscolar}</td>`;
            html += `<td>${item.estado}</td>`;
            html += `<td>${item.cantidad}</td></tr>`;
          });
          html += '<table/>';
          resolve(html);
        } catch (error) {
          reject(error);
        }
      });
    },
    actualizarOlimpiada(idOlimpiadaSeleccionadaNueva) {
      this.olimpiadaSeleccionada = this.olimpiadas.find(
        (item) => item.id === idOlimpiadaSeleccionadaNueva
      );
      this.idOlimpiadaSeleccionada = idOlimpiadaSeleccionadaNueva;
      if (this.olimpiadaSeleccionada != null) {
        this.$storage.set('olimpiadaSeleccionada', this.olimpiadaSeleccionada);
      }
      this.url = this.obtenerRuta();
    },
    async loadParams() {
      try {
        const resultado = await this.$service.get('olimpiadas?limite=50&pagina=1');
        if (resultado && resultado.isOK) {
          this.olimpiadas = resultado && resultado.datos && resultado.datos.filas ? resultado.datos.filas : [];

          if (this.olimpiadaSeleccionada === null) {
            this.idOlimpiadaSeleccionada = this.olimpiadas.length > 0 ? this.olimpiadas[0].id : null;
            this.olimpiadaSeleccionada = this.olimpiadas.length > 0 ? this.olimpiadas[0] : null;
            this.$storage.set('olimpiadaSeleccionada', this.olimpiadas.length > 0 ? this.olimpiadas[0] : null);
          }
          this.filters = [
            {
              field: 'idOlimpiada',
              type: 'array',
              init: this.idOlimpiadaSeleccionada,
              multiple: false,
              label: 'Olimpiadas',
              eventName: 'cambioOlimpiadas',
              onChange: this.actualizarOlimpiada,
              values: this.olimpiadas.map((olimpiada) => ({
                text: olimpiada.nombre,
                value: olimpiada.id,
              })),
            },
          ];

          this.olimpiadaSeleccionada = this.$storage.get('olimpiadaSeleccionada');
          if (this.olimpiadaSeleccionada !== null) {
            this.idOlimpiadaSeleccionada = this.olimpiadaSeleccionada.id;
            await this.actualizarOlimpiada(this.idOlimpiadaSeleccionada);
          }

          await this.revisarEstadoProceso();
          this.showCrudTable = true;
          setTimeout(() => {
            this.updateList();
          }, 100);
        }
      } catch (error) {
        this.$message.error(error.message);
      }
    },

    async revisarEstadoProceso() {
      if (!(this.url || '').includes('null')) {
        const response = await this.$service.get(this.url);
        const result = response.datos.filas.find(
          (x) => x.estadoSorteoPreguntas === ESTADO_EN_PROCESO
            || x.estadoSorteoPreguntasRezagados === ESTADO_EN_PROCESO
            || x.estadoPosicionamiento === ESTADO_OBTENCION_MEDALLERO_PROCESO
            || x.estadoPosicionamiento === ESTADO_CALIFICACION_PROCESO
            || x.estadoPosicionamiento === ESTADO_CLASIFICACION_PROCESO
        );
        if (result) {
          this.enProceso = true;
          setTimeout(() => {
            this.loadParams();
          }, 7000);
        } else {
          this.enProceso = false;
        }
      }
    },

    async activar(item) {
      const message = `¿Está seguro de activar ${item.nombre}?`;
      this.$confirm(message, async () => {
        const response = await this.$service.patch(
          `${this.urlAcciones}/activacion/${item.id}`,
          {}
        );
        if (response.isOK) {
          this.$message.success(response.mensaje);
        } else {
          this.$message.error(
            response.mensaje
              ?? response.message
              ?? `Error al activar ${item.nombre}`
          );
        }
        this.closeModal();
        this.updateList();
      });
    },
    async inactivar(item) {
      const message = `¿Está seguro de inactivar ${item.nombre}?`;
      this.$confirm(message, async () => {
        const response = await this.$service.patch(
          `${this.urlAcciones}/inactivacion/${item.id}`,
          {}
        );
        if (response.isOK) {
          this.$message.success(response.mensaje);
        } else {
          this.$message.error(
            response.mensaje
              ?? response.message
              ?? `Error al inactivar ${item.nombre}`
          );
        }
        this.closeModal();
        this.updateList();
      });
    },
    reset() {
      this.form = {
        id: null,
        nombre: null,
        jerarquia: 0,
        comiteDesempate: false,
        tipo: null,
        minFechaOlimpiada: null,
        maxFechaOlimpiada: null,
        fechaInicio: null,
        fechaFin: null,
        fechaInicioImpugnacion: null,
        fechaFinImpugnacion: null,
        olimpiada: null,
      };
    },
    formatFecha(dateOriginal, formato = 'DD/MM/YYYY') {
      return dateOriginal ? this.$datetime.format(formato, dateOriginal) : '';
    },
    async itemDelete({ items }) {
      // Verificar permiso para ejecutar esta funcion
      if (this.$Casbin && this.$Casbin.enforcer) {
        const { rol } = this.$storage.get('rol');
        const permitido = await this.$Casbin.enforcer.enforce(
          rol,
          '/etapas',
          'delete'
        );
        if (!permitido) {
          this.$message.warning('No tiene permisos');
          return;
        }
      }
      const message = '¿Está seguro de eliminar este registro?';
      this.$confirm(
        message,
        async () => {
          const response = await this.$service.delete(
            `${this.urlAcciones}/${items.id}`
          );
          if (response.isOK) {
            this.updateList();
            this.closeModal();
            await this.getStages();
            this.$message.success('Registro eliminado satisfactoriamente');
          } else {
            this.$message.error(response.message ?? response.mensaje);
          }
        },
        () => {}
      );
    },
    async updateEtapa (items) {
      try {
        this.enProceso = true;
        const data = {
          ...{
            operacion: items.operacion,
            idOlimpiada: this.idOlimpiadaSeleccionada,
          },
          ...items,
        };
        const response = await this.$service.patch(`${this.urlAcciones}/${items.id}/estados`, data);
        if (response.isOK) {
          await this.cargarEtapas();
          const etapaSeleccionada = this.$storage.get('etapaSeleccionada');
          if (etapaSeleccionada) {
            const { id } = etapaSeleccionada;
            const findStage = this.etapas.find(item => item.id === id);
            this.$storage.set('etapaSeleccionada', findStage);
          }

          this.updateList();
          this.closeModal();
          this.$message.success('Etapa actualizada correctamente');
        } else {
          this.$message.error(response.message ?? response.mensaje);
        }
        this.enProceso = false;
      } catch (error) {
        this.$message.error(error.message);
      }
    },
    async actualizarEstado({ items }) {
      // Verificar permiso para ejecutar esta funcion
      if (this.$Casbin && this.$Casbin.enforcer) {
        this.idProceso = items.id;
        const { rol } = this.$storage.get('rol');
        const permitido = await this.$Casbin.enforcer.enforce(
          rol,
          '/etapas',
          'delete'
        );
        if (!permitido) {
          this.$message.warning('No tiene permisos');
          return;
        }
      }

      if (this.tieneAccionParaEjecutar(items) === true) {
        this.accionesEtapas(items);
        return;
      }

      let message = '';
      if (items.estadoCambio === 'CIERRE_PREGUNTAS') {
        const datos = await this.cerrarPreguntas(items.id);
        const resumen = await this.generateResume(datos);
        message = `¿Está seguro de cambiar el estado de <strong>${items.estado}</strong> a <strong>${items.estadoCambio}</strong> de este registro? <br/> <br/>${resumen}`;
      } else if (items.estadoCambio === 'CERRADO') {
        message = 'El medallero y los clasificados serán publicados, ¿Está seguro de continuar?';
      } else {
        message = `¿Está seguro de cambiar el estado de <strong>${items.estado}</strong> a <strong>${items.estadoCambio}</strong> de este registro?`;
      }
      // Mostrando el reporte de los que dieron la prueba
      if (items.estadoCambio === 'HABILITACION_REZAGADOS') {
        this.showReporteEstudiantesQueDieronLaPrueba();
        this.iTmp = {
          ...items,
          message
        };
      } else {
        this.$confirm(
          message,
          async () => {
            if (items.estadoCambio === 'GENERACION_EXAMENES') {
              this.message = true;
              setTimeout(() => {
                this.message = false;
              }, 10000);
            }
            await this.updateEtapa(items);
          },
          () => {},
          'ACEPTAR',
          'CANCELAR',
          items.estadoCambio === 'CIERRE_PREGUNTAS' ? 600 : 360
        );
      }
    },
    formatFechaValidar(dateOriginal, formato, formatoNuevo) {
      if (moment(dateOriginal, formato, 'es').isValid()) {
        return moment(dateOriginal, formato).format(formatoNuevo);
      } else {
        return dateOriginal;
      }
    },
    obtenerFechaInicio(val) {
      this.form.fechaInicio = val;
    },
    obtenerFechaFin(val) {
      this.form.fechaFin = val;
    },
    obtenerFechaInicioImpugnacion(val) {
      this.form.fechaInicioImpugnacion = val;
    },
    obtenerFechaFinImpugnacion(val) {
      this.form.fechaFinImpugnacion = val;
    },
    closeModal() {
      this.modalEtapa = false;
      this.reset();
    },
    actualizarFechaLimiteOlimpiada(idOlimpiada) {
      const olimpiadaSeleccionada = this.olimpiadas.find(
        (item) => item.id === idOlimpiada
      );
      this.form.minFechaOlimpiada = olimpiadaSeleccionada.fechaInicio;
      this.form.maxFechaOlimpiada = olimpiadaSeleccionada.fechaFin;
    },
    async oModal({ items }) {
      if (items && items.id) {
        this.form = { ...items };
        this.form.idOlimpiada = items.olimpiada.id;
        this.form.fechaInicio = this.formatFecha(
          items.fechaInicio,
          'DD-MM-YYYY'
        );
        this.form.fechaFin = this.formatFecha(items.fechaFin, 'DD-MM-YYYY');
        /*
        this.form.fechaInicioImpugnacion = this.formatFecha(
          items.fechaInicioImpugnacion,
          'DD-MM-YYYY'
        );
        this.form.fechaFinImpugnacion = this.formatFecha(
          items.fechaFinImpugnacion,
          'DD-MM-YYYY'
        );
        */

        this.form.minFechaOlimpiada = items.olimpiada.fechaInicio;
        this.form.maxFechaOlimpiada = items.olimpiada.fechaFin;
      } else {
        this.reset();
        this.form.idOlimpiada = this.olimpiadaSeleccionada.id;
        this.form.minFechaOlimpiada = this.olimpiadaSeleccionada.fechaInicio;
        this.form.maxFechaOlimpiada = this.olimpiadaSeleccionada.fechaFin;
      }
      this.modalEtapa = true;
    },
    async generarMedalleros(items) {
      const message = `¿Está seguro de generar el medallero de la etapa ${items.nombre}, solo se puede generar por una vez?`;
      this.$confirm(message, async () => {
        this.enProceso = true;
        const response = await this.$service.patch(
          `medallero/etapa/${items.id}`,
          {}
        );
        if (response.isOK) {
          this.$message.success(response.mensaje);
          this.loadParams();
        } else {
          this.enProceso = false;
          this.$message.error(
            response.message
              ?? response.mensaje
              ?? 'Error al generar medalleros'
          );
        }
      });
    },

    async sorteoPreguntas(items) {
      const message = `¿Está seguro de sortear preguntas de la etapa ${items.nombre}?`;
      this.$confirm(message, async () => {
        this.enProceso = true;
        const response = await this.$service.post(
          `etapas/${items.id}/sorteoPreguntas`,
          {}
        );
        if (response.isOK) {
          this.$message.success(response.mensaje);
          this.loadParams();
        } else {
          this.$message.error(
            response.message
              ?? response.mensaje
              ?? 'Error al sortear preguntas'
          );
        }
      });
    },

    async sorteoPreguntasRezagados(items) {
      const message = `¿Está seguro de sortear preguntas rezagadas de la etapa ${items.nombre}?`;
      this.$confirm(message, async () => {
        this.enProceso = true;
        const response = await this.$service.post(
          `etapas/${items.id}/sorteoPreguntas/rezagados`,
          {}
        );
        if (response.isOK) {
          this.$message.success(response.mensaje);
          this.loadParams();
        } else {
          this.$message.error(
            response.message
              ?? response.mensaje
              ?? 'Error al sortear preguntas rezagadas'
          );
        }
      });
    },

    /**
     * @function save
     * @description Esta funcion esta creada para guardar en la BD
     * @author dbarra@agetic.gob.bo
     */
    async save() {
      if (this.$refs.form.validate()) {
        if (this.form.jerarquia) {
          delete this.form.jerarquia;
        }

        const data = { ...this.form };

        data.fechaInicio = this.formatFechaValidar(
          data.fechaInicio,
          'DD-MM-YYYY',
          'YYYY-MM-DD'
        );
        data.fechaFin = this.formatFechaValidar(
          data.fechaFin,
          'DD-MM-YYYY',
          'YYYY-MM-DD'
        );

        /*
        data.fechaInicioImpugnacion = this.formatFechaValidar(
          data.fechaInicioImpugnacion,
          'DD-MM-YYYY',
          'YYYY-MM-DD'
        );
        data.fechaFinImpugnacion = this.formatFechaValidar(
          data.fechaFinImpugnacion,
          'DD-MM-YYYY',
          'YYYY-MM-DD'
        );
        */
        this.wait = true;
        if (data.id) {
          const response = await this.$service.patch(
            `${this.urlAcciones}/${data.id}`,
            data
          );
          if (response.isOK) {
            console.log(`response: ${response}`);
            this.closeModal();
            this.updateList();
            this.$message.success('Se actualizó el registro correctamente');
          } else {
            this.$message.error(
              response.mensaje ?? 'Ocurrio un error al tratar de enviar la data'
            );
          }
        } else {
          delete data.id;
          const response = await this.$service.post(this.urlAcciones, data);
          if (response.isOK) {
            console.info(`Exito: ${response}`);
            this.closeModal();
            this.updateList();
            this.$message.success('El registro fue agregado correctamente');
          } else {
            console.info(`Error: ${response}`);
            this.$message.error(
              response.mensaje ?? 'Ocurrio un error al tratar de enviar la data'
            );
          }
        }
        this.wait = false;
      } else {
        this.wait = false;
        this.$message.error('Complete los campos obligatorios');
      }
    },

    verInformacion(items) {
      this.estadoInformacion = items.items.estado;
      this.dialogInformacion = !this.dialogInformacion;
    },

    verModalCalificacion(items) {
      this.itemCalificacion = items;
      this.modalCalificacion = true;
    },

    calificarExamenes() {
      const body = {
        items: this.itemCalificacion,
      };
      this.$waiting(true, `Calificando exámenes de la etapa ${this.itemCalificacion.nombre} ...`);
      this.$service.patch(`calificaciones/etapas/${this.itemCalificacion.id}`, body).then((resp) => {
        this.loadParams();
        if (resp.finalizado) {
          this.modalCalificacion = false;
          this.$message.success('Los exámenes fueron calificados');
          this.itemCalificacion = null;
        }
        this.$waiting(false);
      });
    },

    descripcionEstado(estado, siguiente = false) {
      const resp = this.estados.find((x) => x.bd === estado.estado) || '';
      if (siguiente) {
        return this.tieneAccionParaEjecutar(estado) === true
          ? resp.accion
          : this.estados.find((x) => x.bd === estado.estadoCambio) || '';
      }
      return resp;
    },

    tieneAccionParaEjecutar(estado) {
      const resp = this.estados.find((x) => x.bd === estado.estado) || '';
      if (resp.accion) {
        const estadoSeleccionado = this.estados.find((x) => x.bd === estado.estado) || '';
        if (estadoSeleccionado.accion && this.noGenerado(estado)) return true;
      }
      return false;
    },

    noGenerado(estado) {
      if
      (
        (estado.estado === ESTADO_PUBLICACION_RESPUESTAS
        && (
          !estado.estadoPosicionamiento
          || estado.estadoPosicionamiento === ESTADO_CALIFICACION_ERROR
        ))
        || (estado.estado === ESTADO_OBTENCION_MEDALLERO
          && (
            estado.estadoPosicionamiento === ESTADO_CALIFICACION
            || estado.estadoPosicionamiento === ESTADO_OBTENCION_MEDALLERO_ERROR
          ))
        || (
          estado.estado === ESTADO_SORTEO_PREGUNTAS
          && estado.estadoSorteoPreguntas === ESTADO_PENDIENTE
        )
        || (
          estado.estado === ESTADO_SORTEO_PREGUNTAS_REZAGADOS
          && estado.estadoSorteoPreguntasRezagados === ESTADO_PENDIENTE
        )
        || (
          estado.estado === ESTADO_CLASIFICACION
          && (
            estado.estadoPosicionamiento === ESTADO_OBTENCION_MEDALLERO
            || estado.estadoPosicionamiento === ESTADO_CLASIFICACI0N_ERROR
          )
        )
      ) {
        return true;
      }
      return false;
    },

    accionesEtapas(items) {
      switch (items.estado) {
        case ESTADO_PUBLICACION_RESPUESTAS:
          this.verModalCalificacion(items);
          break;
        case ESTADO_OBTENCION_MEDALLERO:
          this.generarMedalleros(items);
          break;
        case ESTADO_SORTEO_PREGUNTAS:
          this.sorteoPreguntas(items);
          break;
        case ESTADO_SORTEO_PREGUNTAS_REZAGADOS:
          this.sorteoPreguntasRezagados(items);
          break;
        case ESTADO_CLASIFICACION:
          this.handleClickClasificarEtapa(items);
          break;
        default:
          break;
      }
    }
  },
  components: {
    CrudTable,
    DateInput,
    vIconComponent,
    Informacion,
    Reporte
  },
};
</script>
<style lang="scss">
@import "../../scss/variables.scss";

.no-uppercase {
  text-transform: none;
}

.dark-is-selected {
  background: #00516d !important;
}

.light-is-selected {
  background: #dbe9f5 !important;
}

.table--resume {
  width: 100%;

  .title {
    font-weight: bold;
    color: $primary;
    font-size: 13px !important;
    text-align: left;
    font-family: $body-font-family !important;
  }

  tr {
    td {
      border-bottom: 1px solid $fontColor;
      padding-top: 10px;
      padding-bottom: 10px;
    }
  }
}

.progress--status {
  position: fixed;
  bottom: 0;
  height: 70px;
  left: 0;
  right: 0;
  z-index: 9;
  display: flex;
  flex-direction: row;
  align-items: stretch;
  justify-content: center;

  .cards {
    width: 50%;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    border: 1px solid $info;
    padding: 15px;

    &:first-child {
      border-right: none;
      background: $info !important;

      &::after {
        position: absolute;
        z-index: 2;
        content: "";
        top: 50%;
        right: 0;
        border: medium none;
        background-color: $info !important;
        width: 1.14285714em;
        height: 1.14285714em;
        border-style: solid;
        border-color: $info;
        border-width: 0 1px 1px 0;
        -webkit-transition: background-color 0.1s ease, opacity 0.1s ease,
          color 0.1s ease, -webkit-box-shadow 0.1s ease;
        transition: background-color 0.1s ease, opacity 0.1s ease,
          color 0.1s ease, -webkit-box-shadow 0.1s ease;
        transition: background-color 0.1s ease, opacity 0.1s ease,
          color 0.1s ease, box-shadow 0.1s ease;
        transition: background-color 0.1s ease, opacity 0.1s ease,
          color 0.1s ease, box-shadow 0.1s ease, -webkit-box-shadow 0.1s ease;
        -webkit-transform: translateY(-50%) translateX(50%) rotate(-45deg);
        transform: translateY(-50%) translateX(50%) rotate(-45deg);
      }
    }
  }
}
</style>
