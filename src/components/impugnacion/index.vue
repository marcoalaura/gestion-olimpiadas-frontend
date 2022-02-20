<template>
  <v-card elevation="0">
    <app-dialog
      :dialog.sync="modalPreguntas"
      :titulo="edicionRespuesta ? 'Editar respuestas' : 'Anular pregunta'"
      @open-dialog="modalPreguntas = true; aOpciones = []; observed = null; state = null; reviewingToApprove = null"
      @close-dialog="modalPreguntas = false; aOpciones = []; observed = null; state = null; reviewingToApprove = null"
      :textoEjecutar="edicionRespuesta ? 'Guardar respuestas' : 'Anular pregunta'"
      btnActions="column"
      @accion="save"
    >
      <template v-if="modalPreguntas">
        <!-- FORMULARIO PARA AGREGAR O EDITAR -->
        <v-form ref="form" v-model="valid" lazy-validation @submit.prevent="save">
          <v-card elevation="0">
            <v-container fluid>
            <v-row>
              <v-col cols="12" class="pb-0">
                <v-select
                  item-color="primary"
                  required
                  :autofocus="!form.id"
                  v-model="form.tipoPregunta"
                  label="Tipo de pregunta (*)"
                  color="primary"
                  :items="aTiposPreguntas"
                  item-text="label"
                  outlined
                  disabled
                  dense
                  item-value="value"
                  :rules="[(val) => !!val || 'No puede estar vacio']"
                ></v-select>
              </v-col>
              <v-col cols="12" class="pb-0">
                <v-select
                  item-color="primary"
                  required
                  v-model="form.tipoRespuesta"
                  label="Tipo de respuesta (*)"
                  color="primary"
                  :items="aTiposRespuestas"
                  disabled
                  item-text="label"
                  outlined
                  dense
                  item-value="value"
                  :rules="[(val) => !!val || 'No puede estar vacio']"
                ></v-select>
              </v-col>
              <v-col cols="12" class="pb-0">
                <v-select
                  item-color="primary"
                  required
                  v-model="form.nivelDificultad"
                  label="Nivel de dificultad (*)"
                  color="primary"
                  :items="aNivelDificultad"
                  item-text="label"
                  outlined
                  disabled
                  dense
                  item-value="value"
                  :rules="[(val) => !!val || 'No puede estar vacio']"
                ></v-select>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" v-if="form.preguntaImagen === 'IMAGEN'" class="d-flex flex-row align-center justify-center">
                <v-img
                  :lazy-src="URL_LAZY_IMAGES"
                  max-height="150"
                  max-width="250"
                  contain
                  :src="form.imageSelected"
                  @error="errorCargaDeImagenes()"
                ></v-img>
              </v-col>
              <v-col cols="12" class="pb-0" v-if="form.preguntaImagen === 'PREGUNTA'">
                <v-textarea
                  item-color="primary"
                  required
                  :autofocus="!form.id"
                  v-model="form.textoPregunta"
                  disabled
                  label="Pregunta (*)"
                  outlined
                  counter
                  dense
                  :rules="[
                    (val) => !!val || 'No puede estar vacio',
                    (val) => (val || '').length <= 1000 || 'La cantidad de caracteres supera lo establecido.'
                  ]"
                ></v-textarea>
              </v-col>
              <v-col cols="12" class="pb-0" v-if="form.tipoRespuesta && form.tipoRespuesta !== FALSO_VERDADERO && form.preguntaImagen">
                <v-card elevation="0" class="mb-3">
                  <v-row no-gutters>
                    <v-col cols="12" sm="12">
                      Opciones:
                    </v-col>
                  </v-row>
                </v-card>
                <v-card elevation="0">
                  <v-alert
                    type="info"
                    text
                    dense
                    class="fs8"
                    width="100%"
                    v-if="form.preguntaImagen === 'IMAGEN'"
                  >
                    El texto de las opciones se limpiaran cuando se envien porque estas se encuentran en la imagen.
                  </v-alert>
                  <template v-for="opcion in aOpciones">
                    <v-opciones
                      :key="opcion.key"
                      :letter="opcion.key"
                      :value="opcion.text"
                      :observado="true"
                      :imagen="form.preguntaImagen"
                    />
                  </template>
                </v-card>
              </v-col>
            </v-row>
            <v-row elevation="0" v-if="form.tipoRespuesta && form.tipoRespuesta === FALSO_VERDADERO">
              <v-col cols="12" class="pb-0">
                Respuesta (*):
              </v-col>
              <v-col cols="12" class="pb-0">
                <v-radio-group
                  class="mt-0 pt-0"
                  :disabled="!edicionRespuesta"
                  v-model="form.opciones"
                  :rules="[(val) => !!val || 'Tiene que marcar si la pregunta es falso o verdadero']"
                >
                  <v-radio
                    label="Falso"
                    value="FALSO"
                  ></v-radio>
                  <v-radio
                    label="Verdadero"
                    value="VERDADERO"
                  ></v-radio>
                </v-radio-group>
              </v-col>
            </v-row>
            <v-row v-if="form.tipoRespuesta && form.tipoRespuesta !== FALSO_VERDADERO && form.preguntaImagen">
              <v-col cols="12">
                <v-alert
                  type="info"
                  text
                  dense
                  class="fs8"
                  width="100%"
                >
                Si el tipo de respuesta es <strong>{{ SELECCION_SIMPLE.replace(/_/g, ' ') }}</strong> entonces en el campo "respuesta" solo seleccione la opción correcta.<br/><br/>
                Si el tipo es respuesta es <strong>{{ SELECCION_MULTIPLE.replace(/_/g, ' ') }}</strong> entonces en el campo "respuesta" seleccione varias opciones correctas como minimo {{ CANTIDAD_MINIMA_RESPUESTA_SELECCION_MULTIPLE }}
                </v-alert>
              </v-col>
              <v-col cols="12" class="pb-0">
                <v-select
                  item-color="primary"
                  required
                  :disabled="!edicionRespuesta"
                  v-model="form.respuestas"
                  label="Respuesta (*)"
                  outlined
                  :multiple="form.tipoRespuesta === SELECCION_MULTIPLE"
                  :items="aRespuestas"
                  :rules="form.tipoRespuesta === SELECCION_SIMPLE ? [(val) => !!val || 'La respuesta no puede estar vacio'] : [(val) => !!val.length > 0 || 'La respuesta no puede estar vacio']"
                  dense
                ></v-select>
              </v-col>
            </v-row>
          </v-container>
          </v-card>
        </v-form>
      </template>
    </app-dialog>
    <crud-table
      v-if="showCrudTable"
      :headers="headers"
      description="Impugnación de preguntas"
      :url.sync="url"
      :widthModal="500"
      :show-filter-init="true"
      :filters.sync="filters"
      :order="order"
      :custom="true"
      :omitir-carga-on-mounted="true"
    >
      <!-- SLOT PARA TODOS LOS ITEMS (Solo en caso de que se quiera personalizar cada columna o mas de 1 columna) -->
      <template slot="items" slot-scope="items">
        <tr :class="getQuestionStatus(items)">
          <td :class="items.items.estado === ESTADO_OBSERVADO ? 'white--text' : ''">{{ items.items.tipoPregunta }}</td>
          <td :class="items.items.estado === ESTADO_OBSERVADO ? 'white--text' : ''">{{
              items.items.nivelDificultad
            }}
          </td>
          <td class="text--wrap">
            <div :class="items.items.estado === ESTADO_OBSERVADO ? 'white--text' : ''">{{
                items.items.textoPregunta
              }}
            </div>
            <v-show-more v-if="(items.items.textoPregunta || '').trim().length > 0" :text="items.items.textoPregunta"/>
          </td>
          <td>
            <v-show-more className="show-images" v-if="items.items.imagenPregunta" image :url="limpiarURLImagen(`${URL_SERVER_IMAGES}${items.items.imagenPregunta}`)"/>
          </td>
          <td>
            <v-tooltip bottom :color="getQuestionStatus(items, 'element')">
              <template v-slot:activator="{ on }">
                <v-btn
                  :ripple="false"
                  plain
                  text
                  class="cursor-normal"
                  :color="getQuestionStatus(items, 'element')"
                  v-on="on"
                >
                  <strong>
                   {{ items.items.estado }}
                  </strong>
                </v-btn>
              </template>
              {{ items.items.estado }}
            </v-tooltip>
          </td>
          <td>
            <v-tooltip bottom color="success" v-if="sePuedeImpugnar">
              <template v-slot:activator="{ on }">
                <v-btn
                  icon
                  v-on="on"
                  color="success"
                  @click.stop="
                    observed = null;
                    state = items.items.estado;
                    edicionRespuesta = true;
                    handleClickQuestion(items)
                  "
                >
                  <v-icon-component icon="edit"></v-icon-component>
                </v-btn>
              </template>
              <span>Editar respuestas</span>
            </v-tooltip>
            <v-tooltip bottom color="error" v-if="sePuedeImpugnar">
              <template v-slot:activator="{ on }">
                <v-btn
                  icon
                  v-on="on"
                  color="error"
                  v-if="items.items.estado !== 'ANULADO'"
                  @click.prevent="
                    edicionRespuesta = false;
                    handleClickQuestion(items)"
                >
                  <v-icon-component icon="remove_circle"></v-icon-component>
                </v-btn>
              </template>
              <span>Anular pregunta</span>
            </v-tooltip>
          </td>
        </tr>
      </template>
    </crud-table>
    <v-alert
      type="warning"
      dense
      text
      class="fs9"
      v-else
    >
    No existen registros, porque no existen áreas asignadas a esta etapa.
    </v-alert>
  </v-card>
</template>
<script>
import CrudTable from '@/plugins/crud-table/CrudTable.vue';
import actions from '@/plugins/crud-table/mixins/crud-table';
import vIconComponent from '@/plugins/icon/index.vue';
import AppDialog from '@/plugins/modal/AppDialog.vue';
import vOpciones from '../bancoPreguntas/opciones.vue';

const SELECCION_SIMPLE = 'SELECCION_SIMPLE';
const SELECCION_MULTIPLE = 'SELECCION_MULTIPLE';
const FALSO_VERDADERO = 'FALSO_VERDADERO';
const URL_SERVER_IMAGES = process.env.VUE_APP_SERVER_MEDIA;

const ESTADO_CREADO = 'CREADO';
const ESTADO_ENVIADO = 'ENVIADO';
const ESTADO_OBSERVADO = 'OBSERVADO';

const CANTIDAD_MINIMA_OPCIONES_SELECCION_SIMPLE = 4; // ECU - v1.0.3
const CANTIDAD_MINIMA_OPCIONES_SELECCION_MULTIPLE = 4; // ECU - v1.0.3

const CANTIDAD_MINIMA_RESPUESTA_SELECCION_MULTIPLE = 2; // ECU - v1.0.3
export default {
  mixins: [actions],
  data: () => ({
    name: '',
    url: null,
    actualizarRegistro: null,
    form: {},
    valid: null,
    btnEdit: null,
    parametros: null,
    reviewingToApprove: null,
    newUrl: null,
    observed: null,
    modalPreguntas: null,
    uploading: null,
    SELECCION_SIMPLE: SELECCION_SIMPLE,
    SELECCION_MULTIPLE: SELECCION_MULTIPLE,
    FALSO_VERDADERO: FALSO_VERDADERO,
    ESTADO_CREADO: ESTADO_CREADO,
    ESTADO_ENVIADO: ESTADO_ENVIADO,
    ESTADO_OBSERVADO: ESTADO_OBSERVADO,
    ESTADO_IMPUGNACION_PREGUNTAS_RESPUESTAS: 'IMPUGNACION_PREGUNTAS_RESPUESTAS',
    URL_SERVER_IMAGES: URL_SERVER_IMAGES,
    URL_LAZY_IMAGES: `${process.env.VUE_APP_FRONTEND}/img/loader.gif`,
    state: null,
    CANTIDAD_MINIMA_OPCIONES_SELECCION_SIMPLE: CANTIDAD_MINIMA_OPCIONES_SELECCION_SIMPLE,
    CANTIDAD_MINIMA_OPCIONES_SELECCION_MULTIPLE: CANTIDAD_MINIMA_OPCIONES_SELECCION_MULTIPLE,
    CANTIDAD_MINIMA_RESPUESTA_SELECCION_MULTIPLE: CANTIDAD_MINIMA_RESPUESTA_SELECCION_MULTIPLE,
    aTiposPreguntas: [],
    aTiposRespuestas: [],
    aNivelDificultad: [],
    aEtapas: [],
    etapas: [],
    idStage: null,
    aAreas: [],
    idArea: null,
    abecedario: [],
    aOpciones: [],
    aRespuestas: [],
    edicionRespuesta: false,
    order: ['createdAt', 'DESC'],
    filters: [],
    showCrudTable: false,
    headers: [
      {
        text: 'Tipo de pregunta',
        align: 'center',
        value: 'tipoPregunta',
      },
      {
        text: 'Nivel',
        align: 'center',
        value: 'nivelDificultad',
      },
      {
        text: 'Pregunta',
        align: 'center',
        value: 'textoPregunta',
      },
      {
        text: 'Imagen',
        align: 'center',
        value: 'imagenPregunta',
      },
      {
        text: 'Estado',
        sortable: false,
        value: 'estado',
      },
      {
        text: 'Acciones',
        divider: false,
        sortable: false,
        align: 'center',
        value: 'ACTIONS',
      },
    ],
    etapaSeleccionada: null,
    sePuedeImpugnar: false,
  }),
  methods: {
    async actualizarOlimpiada(idOlimpiadaSeleccionadaNueva) {
      this.olimpiadaSeleccionada = this.olimpiadas.find(item => item.id === idOlimpiadaSeleccionadaNueva);
      this.idOlimpiadaSeleccionada = idOlimpiadaSeleccionadaNueva;
      if (this.olimpiadaSeleccionada != null) {
        this.$storage.set('olimpiadaSeleccionada', this.olimpiadaSeleccionada);
      }
      this.idEtapaSeleccionada = null;
      this.$storage.set('etapaSeleccionada', null);
      await this.cargarEtapas();

      this.idAreaSeleccionada = null;
      this.$storage.set('areaSeleccionada', null);
      this.areas = [];

      this.filters = this.definirFiltros();
      this.url = this.obtenerRuta();

      setTimeout(() => {
        this.updateList();
      }, 100);
    },
    async actualizarEtapa(idEtapaSeleccionadaNueva) {
      this.etapaSeleccionada = this.etapas.find(item => item.id === idEtapaSeleccionadaNueva);
      this.idEtapaSeleccionada = idEtapaSeleccionadaNueva;
      this.$storage.set('etapaSeleccionada', this.etapaSeleccionada);
      this.$storage.set('areaSeleccionada', null);
      if (this.etapaSeleccionada.estado === 'IMPUGNACION_PREGUNTAS_RESPUESTAS') {
        this.sePuedeImpugnar = true;
      } else {
        this.sePuedeImpugnar = false;
      }
      this.areaSeleccionada = null;
      this.idAreaSeleccionada = null;

      await this.cargarAreas();

      this.filters = this.definirFiltros();
      this.url = this.obtenerRuta();

      setTimeout(() => {
        this.updateList();
      }, 100);
    },
    actualizarArea(idAreaSeleccionadaNueva) {
      this.areaSeleccionada = this.areas.find(item => item.id === idAreaSeleccionadaNueva);
      this.idAreaSeleccionada = idAreaSeleccionadaNueva;
      this.$storage.set('areaSeleccionada', this.areaSeleccionada);
      this.filters = this.definirFiltros();
      this.url = this.obtenerRuta();
    },
    obtenerRuta() {
      return `etapasAreaGrado/${this.idAreaSeleccionada}/preguntas`;
    },
    limpiarURLImagen(url) {
      if (typeof url === 'string') {
        return url.replace(/([^:]\/)\/+/g, '$1');
      }
      return url;
    },
    errorCargaDeImagenes() {
      this.$message.error('No se encontró la imagen de la pregunta');
    },
    async cargarEtapas() {
      try {
        if (this.idOlimpiadaSeleccionada) {
          const resultado = await this.$service.get(`olimpiadas/${this.idOlimpiadaSeleccionada}/etapas`);
          if (resultado) {
            this.etapas = resultado && resultado.datos && resultado.datos.filas ? resultado.datos.filas : [];
          }
          this.etapaSeleccionada = this.$storage.get('etapaSeleccionada');
          for (const etapa of this.etapas) {
            if (this.etapaSeleccionada?.id === etapa.id) {
              this.sePuedeImpugnar = etapa.estado === this.ESTADO_IMPUGNACION_PREGUNTAS_RESPUESTAS;
            }
          }
        }
      } catch (error) {
        this.$message.error(error.message);
      }
    },
    async cargarAreas() {
      try {
        if (this.idEtapaSeleccionada) {
          const resultado = await this.$service.get(`etapas/${this.idEtapaSeleccionada}/etapaAreaGrados`);
          if (resultado && resultado.isOK) {
            this.areas = resultado && resultado.datos && resultado.datos.filas ? resultado.datos.filas : [];
          }
        } else {
          this.$message.info('Debe seleccionar una olimpiada, etapa y el area');
          throw new Error('No hay etapas seleccionadas');
        }
      } catch (error) {
        this.areas = [];
      }
    },
    async loadParams() {
      try {
        const olimpiadas = await this.$service.get('olimpiadas?limite=50&pagina=1');
        if (olimpiadas) {
          this.olimpiadas = olimpiadas && olimpiadas.datos && olimpiadas.datos.filas ? olimpiadas.datos.filas : [];
          this.olimpiadaSeleccionada = this.olimpiadas.length > 0 ? this.olimpiadas[0] : null;
          this.idOlimpiadaSeleccionada = this.olimpiadaSeleccionada ? this.olimpiadaSeleccionada.id : null;
        }
        if (this.olimpiadas.length === 0) {
          this.$storage.set('olimpiadaSeleccionada', null);
          this.$storage.set('etapaSeleccionada', null);
          this.$storage.set('areaSeleccionada', null);
          this.idOlimpiadaSeleccionada = null;
          this.idEtapaSeleccionada = null;
          this.idAreaSeleccionada = null;
        }
        await this.cargarEtapas();
        await this.cargarAreas();
        const resultado = await this.$service.get('grados-escolares');
        if (resultado) {
          this.gradosEscolares = resultado && resultado.datos && resultado.datos.filas ? resultado.datos.filas : [];
        }
        this.filters = this.definirFiltros();
        this.showCrudTable = true;
        setTimeout(() => {
          this.updateList();
        }, 100);
      } catch (error) {
        this.$message.error(error.message);
      }
    },
    definirFiltros() {
      return [
        {
          field: 'idOlimpiada',
          type: 'array',
          init: this.idOlimpiadaSeleccionada,
          multiple: false,
          label: 'Olimpiadas',
          eventName: 'cambioOlimpiadas',
          onChange: this.actualizarOlimpiada,
          values: this.olimpiadas.map(olimpiada => ({
            text: olimpiada.nombre,
            value: olimpiada.id
          })),
        },
        {
          field: 'idEtapa',
          type: 'array',
          init: this.idEtapaSeleccionada,
          multiple: false,
          nowrap: true,
          label: 'Etapas',
          disabled: ['COMITE_DOCENTE_CARGA', 'COMITE_DOCENTE_VERIFICADOR'].includes(this.$storage.get('rol').rol),
          eventName: 'cambioEtapas',
          onChange: this.actualizarEtapa,
          values: this.etapas.map(etapa => ({
            text: etapa.nombre,
            value: etapa.id
          })),
        },
        {
          field: 'idEtapaAreaGrado',
          type: 'array',
          init: this.idAreaSeleccionada,
          multiple: false,
          nowrap: true,
          label: 'Áreas Grado',
          eventName: 'cambioAreas',
          onChange: this.actualizarArea,
          values: this.areas.map(area => ({
            text: `${area.area.nombre} - ${area.gradoEscolar.nombre} `,
            value: area.id
          })),
        },
        {
          field: 'tipoPregunta',
          type: 'array',
          multiple: false,
          label: 'Tipo de pregunta',
          values: [
            'OLIMPIADA',
            'CURRICULA'
          ]
        },
        {
          field: 'nivelDificultad',
          type: 'array',
          multiple: false,
          label: 'Nivel de dificultad',
          values: [
            'COMPLEJA',
            'INTERMEDIA',
            'BASICA'
          ]
        },
        {
          field: 'tipoRespuesta',
          type: 'array',
          multiple: false,
          label: 'Tipo de respuesta',
          values: [
            'SELECCION_MULTIPLE',
            'SELECCION_SIMPLE',
            'FALSO_VERDADERO'
          ]
        },
        {
          field: 'estado',
          type: 'array',
          multiple: false,
          label: 'Estado',
          values: [
            'CREADO',
            'OBSERVADO',
            'ENVIADO',
            'APROBADO'
          ]
        }
      ];
    },
    getQuestionStatus ({ items: { estado } }, dom = 'row') {
      let className;
      if (estado === this.ESTADO_OBSERVADO && dom) {
        className = 'pregunta--observada';
      }
      if (estado === this.ESTADO_CREADO && dom === 'element') {
        className = 'info';
      }
      if (estado === this.ESTADO_OBSERVADO && dom === 'element') {
        className = 'white';
      }
      return className;
    },
    remove () {
      this.form.imagenPregunta = null;
    },
    reset() {
      this.form = {};
      this.aOpciones = [];
    },
    handleClickQuestion({ items }) {
      this.reset();
      if (items && items.id) {
        this.form = { ...items };
        this.form = {
          ...this.form,
          observacion: (this.form.observacion || '').trim().length === 0 ? null : this.form.observacion
        };
        if (items.tipoRespuesta === this.FALSO_VERDADERO) {
          this.form = {
            ...this.form,
            opciones: items.respuestas.includes('FALSO') ? 'FALSO' : 'VERDADERO',
            preguntaImagen: (items.textoPregunta || '').length === 0 ? 'IMAGEN' : 'PREGUNTA'
          };
        } else {
          this.aOpciones = items.opciones ? Object.keys(items.opciones).map(item => {
            const obj = {};
            obj.key = item;
            obj.text = items.opciones[item];
            return obj;
          }) : null;

          this.aRespuestas = Object.keys(items.opciones);
          this.form = {
            ...this.form,
            preguntaImagen: (items.textoPregunta || '').length === 0 ? 'IMAGEN' : 'PREGUNTA',
            respuestas: items.tipoRespuesta === this.SELECCION_SIMPLE ? items.respuestas[0] : items.respuestas
          };
        }
        if (typeof items.imagenPregunta === 'string') {
          this.form.imageSelected = this.limpiarURLImagen(`${this.URL_SERVER_IMAGES}${items.imagenPregunta}`);
        }
      } else {
        this.aOpciones = [];
        this.aRespuestas = Object.keys(this.aOpciones).map(item => this.abecedario[item]);
      }
      this.modalPreguntas = true;
    },
    anularPregunta(id) {
      this.$confirm(`¿Está seguro de anular la pregunta, esto afectará a los resultados
        obtenidos?`, async () => {
        this.$waiting(true, `Anulando y re-calificando exámenes de la etapa ${this.etapaSeleccionada.nombre} ...`);
        const response = await this.$service.patch(`preguntas/${id}/impugnacion`, { estado: 'ANULADO' });
        this.$waiting(false);
        if (response && response.finalizado) {
          this.$message.success('Pregunta anulada correctamente');
          this.updateList();
          this.modalPreguntas = false;
        } else {
          this.$message.error(response.mensaje);
        }
      });
    },
    async save() {
      if (!this.edicionRespuesta) {
        this.anularPregunta(this.form.id);
        return;
      }
      this.$confirm(
        `¿Está
          seguro de que desea cambiar la respuesta, esto afectará a los resultados
          obtenidos?`,
        async () => {
          try {
            if (this.$refs.form.validate()) {
              const opciones = this.aOpciones.reduce((container, item) => {
                container[item.key] = item.text;
                return container;
              }, {});
              let respuestas;
              if (this.form.tipoRespuesta === this.FALSO_VERDADERO) {
                respuestas = [this.form.opciones];
                this.form.respuestas = respuestas;
              } else {
                respuestas = (Array.isArray(this.form.respuestas)) ? this.form.respuestas : this.form.respuestas.split(',');
                respuestas = respuestas.map(item => item.trim());
              }
              const data = { ...this.form, opciones, respuestas };
              if (data.tipoRespuesta === this.SELECCION_MULTIPLE) {
                if (!(this.form.respuestas.length >= this.CANTIDAD_MINIMA_RESPUESTA_SELECCION_MULTIPLE)) {
                  this.$message.error(`La cantidad mínima de respuestas para una <strong>${data.tipoRespuesta.replace(/_/g, ' ')}</strong> es de <strong>${this.CANTIDAD_MINIMA_RESPUESTA_SELECCION_MULTIPLE}</strong>`);
                  return;
                }
              }
              if ([this.SELECCION_SIMPLE].includes(this.form.tipoRespuesta)) {
                this.form.respuestas = [this.form.respuestas];
              }
              this.$waiting(true, 'Guardando respuesta');
              const response = await this.$service.patch(`preguntas/${this.form.id}/impugnacion`, { respuestas: this.form.respuestas, estado: this.form.estado });
              this.$waiting(false);
              if (response && response.isOK) {
                this.$message.success(response.mensaje);
                this.modalPreguntas = false;
                this.updateList();
              } else {
                throw new Error(response.mensaje);
              }
            } else {
              this.$message.error('Complete los campos obligatorios');
            }
          } catch (error) {
            this.$message.error(error.message);
          }
        }
      );
    }
  },
  mounted() {
    this.$nextTick(async () => {
      const { rol } = this.$storage.get('rol');
      this.btnEdit = await this.$Casbin.enforcer.enforce(rol, '/banco-preguntas', 'update');
      this.abecedario = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'];
      const aTiposPreguntas = await this.$service.get('preguntas/tipoPreguntas');
      this.aTiposPreguntas = aTiposPreguntas.datos.map((pregunta) => {
        const obj = {};
        obj.label = pregunta.replace(/_/gi, ' ');
        obj.value = pregunta;
        return obj;
      });
      const aTiposRespuestas = await this.$service.get('preguntas/tipoRespuestas');
      this.aTiposRespuestas = aTiposRespuestas.datos.map((pregunta) => {
        const obj = {};
        obj.label = pregunta.replace(/_/gi, ' ');
        obj.value = pregunta;
        return obj;
      });
      const aNivelesDificultad = await this.$service.get(
        'preguntas/nivelesDificultad'
      );
      this.aNivelDificultad = aNivelesDificultad.datos.map((data) => {
        const obj = {};
        obj.label = data.replace(/_/gi, ' ');
        obj.value = data;
        return obj;
      });

      this.olimpiadaSeleccionada = this.$storage.get('olimpiadaSeleccionada');
      if (this.olimpiadaSeleccionada !== null) {
        this.idOlimpiadaSeleccionada = this.olimpiadaSeleccionada.id;
      } else {
        this.idOlimpiadaSeleccionada = null;
      }

      this.etapaSeleccionada = this.$storage.get('etapaSeleccionada');
      if (this.etapaSeleccionada !== null) {
        this.idEtapaSeleccionada = this.etapaSeleccionada.id;
      } else {
        this.idEtapaSeleccionada = null;
      }

      this.areaSeleccionada = this.$storage.get('areaSeleccionada');

      if (this.areaSeleccionada !== null) {
        this.idAreaSeleccionada = this.areaSeleccionada.id;
      } else {
        this.idAreaSeleccionada = null;
      }

      await this.loadParams();
      this.url = this.obtenerRuta();
    });
  },
  components: {
    CrudTable,
    vIconComponent,
    AppDialog,
    vOpciones
  },
};
</script>
<style lang="scss">
@import '../../scss/variables.scss';
.mradio {
  .v-input--radio-group__input {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
  }
}
.pregunta--observada {
  background:#e57373;
  &:hover {
    background:#e57373 !important;
  }
}
</style>
