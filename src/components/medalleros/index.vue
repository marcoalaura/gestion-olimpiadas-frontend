<template>
  <v-card elevation="0">
    <template>
      <Medallero
        :dialog="dialog"
        :medallero="medallero"
        :metodo="metodo"
        :btnEditar="btnEditar"
        @actualizarLista="actualizarLista"
      />
      <v-card elevation="0" v-show="mostrar">
        <crud-table
          v-if="showCrudTable"
          description="Medalleros"
          :headers="headers"
          :key="componentKey"
          ref="table"
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
            <v-tooltip
              bottom
              color="primary"
              v-if="btnGenerarActa && btnGenerarActaRol"
            >
              <template v-slot:activator="{ on }">
                <v-btn
                  color="primary"
                  :small="['xs', 'sm'].includes($vuetify.breakpoint.name)"
                  icon
                  v-on="on"
                  @click.native.stop="generarActa"
                  slot="activator"
                >
                  <v-icon-component icon="file_download" />
                </v-btn>
              </template>
              <span> Generar Acta </span>
            </v-tooltip>
            <v-tooltip
              bottom
              color="grey darken-1"
              v-if="!btnGenerarActa && btnGenerarActaRol"
            >
              <template v-slot:activator="{ on }">
                <v-btn
                  color="grey darken-1"
                  :small="['xs', 'sm'].includes($vuetify.breakpoint.name)"
                  icon
                  v-on="on"
                  slot="activator"
                >
                  <v-icon-component disabled icon="file_download" />
                </v-btn>
              </template>
              <span>
                Generar Acta se activará cuando se obtenga los clasificados.
              </span>
            </v-tooltip>
          </template>

          <template slot="items" slot-scope="items">
            <tr>
              <td>{{ items.items.area }}</td>
              <td>
                {{ items.items.grado_escolar }}
                <br />
                <small class="primary--text" v-if="items.items.estudiantes == 1"
                  >{{ items.items.estudiantes }} estudiante en medallero.</small
                >
                <small
                  class="primary--text"
                  v-else-if="items.items.estudiantes > 1"
                  >{{ items.items.estudiantes }} estudiantes en
                  medallero.</small
                >
                <small class="primary--text" v-else
                  >No existe estudiantes.</small
                >
              </td>
              <td
                class="text-uppercase"
                v-if="etapaTipo == 'DEPARTAMENTAL' || etapaTipo == 'DISTRITAL'"
              >
                {{ items.items.departamento }}
              </td>
              <td class="text-uppercase" v-if="etapaTipo == 'DISTRITAL'">
                {{ items.items.distrito }}
              </td>
              <td>
                <v-tooltip
                  bottom
                  :color="items.items.estado_medallero ? 'green' : 'red'"
                >
                  <template v-slot:activator="{ on }">
                    <v-btn
                      :ripple="false"
                      plain
                      text
                      class="cursor-normal"
                      :color="items.items.estado_medallero ? 'green' : 'red'"
                      v-on="on"
                    >
                      <strong>
                        <label v-if="items.items.estado_medallero"
                          >GENERADO</label
                        >
                        <label v-else>EN COMITÉ</label>
                      </strong>
                    </v-btn>
                  </template>
                  <label v-if="items.items.estado_medallero"
                    >Medallero generado
                  </label>
                  <label v-else>Medallero en comité para desempate </label>
                </v-tooltip>
              </td>

              <td>
                <v-tooltip
                  bottom
                  color="grey darken-1"
                  v-if="items.items.estudiantes == 0"
                >
                  <template v-slot:activator="{ on }">
                    <v-btn icon v-on="on" color="grey darken-1">
                      <v-icon-component
                        disabled
                        icon="remove_red_eye"
                      ></v-icon-component>
                    </v-btn>
                  </template>
                  <span>No existe estudiantes en el medallero</span>
                </v-tooltip>

                <v-tooltip
                  bottom
                  color="green"
                  v-if="items.items.estudiantes > 0"
                >
                  <template v-slot:activator="{ on }">
                    <v-btn
                      icon
                      v-on="on"
                      color="green"
                      @click.stop="verMedallero(items.items, 'ver')"
                    >
                      <v-icon-component
                        icon="remove_red_eye"
                      ></v-icon-component>
                    </v-btn>
                  </template>
                  <span>Ver Medallero</span>
                </v-tooltip>

                <v-tooltip
                  bottom
                  color="red"
                  v-if="!items.items.estado_medallero && btnEditar"
                >
                  <template v-slot:activator="{ on }">
                    <v-btn
                      icon
                      v-on="on"
                      color="red"
                      @click.stop="verMedallero(items.items, 'editar')"
                    >
                      <v-icon-component icon="mode"></v-icon-component>
                    </v-btn>
                  </template>
                  <span>Desempatar Medallero</span>
                </v-tooltip>
              </td>
            </tr>
          </template>
        </crud-table>
        <v-alert color="primary"
          outlined
          type="warning"
          prominent
          v-if="etapaSeleccionada && etapaSeleccionada.comiteDesempate && btnEditar ? etapaSeleccionada.comiteDesempate : false"
          border="left">
          El desempate se realiza de los estudiantes que ingresaron en los puestos medallero respectivo tomando en cuenta el puntaje y el tiempo de examen.
        </v-alert>
        <v-card elevation="0" v-if="medalleroGenerado == 1">
          <template>
            <v-row
              align="center"
              class="text-center"
              style="padding: 80px !important"
            >
              <v-col cols="12">
                <v-card elevation="0" width="100%" align="center">
                  <label class="primary--text">
                    El medallero de la etapa
                    {{ etapaSeleccionada.nombre }} aún no fue generado
                  </label>
                </v-card>
              </v-col>
            </v-row>
          </template>
        </v-card>
      </v-card>
    </template>
  </v-card>
</template>
<script>
import vIconComponent from '@/plugins/icon/index.vue';
import { $Casbin } from '@/plugins/casbin';
import CrudTable from '@/plugins/crud-table/CrudTable.vue';
import validate from '@/common/mixins/validate';
import actions from '@/plugins/crud-table/mixins/crud-table';
import Medallero from '@/components/medalleros/medallero.vue';

const ESTADO_MOSTRAR_ACTA = 'GENERAR_CLASIFICADOS';
const ESTADO_GENERAR_CLASIFICADOS = 'GENERAR_CLASIFICADOS';

export default {
  mixins: [actions, validate],
  components: {
    vIconComponent,
    CrudTable,
    Medallero,
  },
  data: () => ({
    componentKey: 0,
    mostrar: true,
    url: 'medallero',
    order: ['createdAt', 'DESC'],
    idOlympiad: null,
    etapaSeleccionada: { nombre: '0' },
    medalleroGenerado: 0,
    etapaTipo: null,
    medallero: [],
    dialog: false,
    idOlimpiadaSeleccionada: null,
    showCrudTable: false,
    filters: [],
    headers: [],
    metodo: 'ver',
    etapas: [],
    btnEditar: false,
    btnGenerarActa: false,
    btnGenerarActaRol: false,
    rol: '',
    idDepartamento: null,
    idArea: null,
  }),
  mounted() {
    this.$nextTick(async () => {
      if ($Casbin && $Casbin.enforcer) {
        const { rol } = this.$storage.get('rol');
        this.rol = rol;
        $Casbin.enforcer
          .enforce(rol, '/medalleros-generar', 'update')
          .then((permitido) => {
            this.btnEditar = permitido;
          });
        $Casbin.enforcer
          .enforce(rol, '/medalleros-generar', 'acta')
          .then((permitido) => {
            this.btnGenerarActaRol = permitido;
          });
      }

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
      this.url = this.etapaSeleccionada
        ? `medallero/etapa/${this.etapaSeleccionada.id}/listar`
        : 'medallero';
      await this.loadParams();
    });
  },
  methods: {
    async actualizarOlimpiada(idOlimpiadaSeleccionadaNueva) {
      this.componentKey += 1;
      this.olimpiadaSeleccionada = this.olimpiadas.find(
        (item) => item.id === idOlimpiadaSeleccionadaNueva
      );
      this.idOlimpiadaSeleccionada = idOlimpiadaSeleccionadaNueva;
      if (this.olimpiadaSeleccionada != null) {
        this.$storage.set('olimpiadaSeleccionada', this.olimpiadaSeleccionada);
      }
      this.idEtapaSeleccionada = null;
      this.$storage.set('etapaSeleccionada', null);
      await this.cargarEtapas();

      this.filters = this.definirFiltros();
      this.url = 'medallero/etapa/null/listar';
      this.headers.splice(0, 6);
      this.filters.splice(2, 4);
      this.medalleroGenerado = 0;
      this.$message.success('Seleccione la etapa correspondiente');
      setTimeout(() => {
        this.updateList();
      }, 100);
    },

    async actualizarEtapa(idEtapaSeleccionadaNueva) {
      this.componentKey += 1;
      this.medalleroGenerado = 0;
      this.etapaSeleccionada = this.etapas.find(
        (item) => item.id === idEtapaSeleccionadaNueva
      );
      this.idEtapaSeleccionada = idEtapaSeleccionadaNueva;
      if (this.etapaSeleccionada != null) {
        this.$storage.set('etapaSeleccionada', this.etapaSeleccionada);
      }
      this.$root.$refs.CrudTable.cargarFiltro(this.definirFiltros());
      await this.cargarListaMedallero();
    },

    async cargarEtapas() {
      try {
        if (this.idOlimpiadaSeleccionada) {
          const resultado = await this.$service.get(`olimpiadas/${this.idOlimpiadaSeleccionada}/etapas`);
          if (resultado && resultado.isOK) {
            this.etapas = resultado && resultado.datos && resultado.datos.filas ? resultado.datos.filas : [];
          }
        }
      } catch (error) {
        this.$message.error(error.message);
      }
    },

    async loadParams() {
      try {
        this.medalleroGenerado = null;
        const resultado = await this.$service.get('olimpiadas?limite=50&pagina=1');
        if (resultado && resultado.isOK) {
          this.olimpiadas = resultado && resultado.datos && resultado.datos.filas
            ? resultado.datos.filas
            : [];
        }
        if (this.olimpiadas.length > 0) {
          this.idOlimpiadaSeleccionada = this.olimpiadas.length > 0 ? this.olimpiadas[0].id : null;
          this.olimpiadaSeleccionada = this.olimpiadas.length > 0 ? this.olimpiadas[0] : null;
          this.$storage.set('olimpiadaSeleccionada', this.olimpiadas.length > 0 ? this.olimpiadas[0] : null);
        } else {
          this.$storage.set('olimpiadaSeleccionada', null);
          this.$storage.set('etapaSeleccionada', null);
          this.$storage.set('areaSeleccionada', null);
          this.idOlimpiadaSeleccionada = null;
        }

        await this.cargarEtapas();
        await this.cargarListaMedallero();
        setTimeout(() => {
          this.updateList();
        }, 100);
      } catch (error) {
        this.$message.error(error.message);
      }
    },

    actualizarLista() {
      this.updateList();
    },

    async cargarListaMedallero() {
      this.filters = this.definirFiltros();
      this.mostrar = false;
      if (this.etapaSeleccionada && this.etapaSeleccionada.id) {
        this.url = `medallero/etapa/${this.etapaSeleccionada.id}/listar`;
      } else {
        this.url = 'medallero/etapa/null/listar';
      }
      this.headers = this.definirHeaders();
      if (this.etapaSeleccionada != null) {
        this.url = `medallero/etapa/${this.etapaSeleccionada.id}/listar`;
        const response = await this.$service.get(this.url);
        this.medalleroGenerado = response.datos.total > 0 ? 2 : 1;
        this.etapaTipo = response.datos.etapaTipo;
        this.idArea = response.datos.filas[0]?.id_area;
        this.btnGenerarActa = response.datos.etapaEstado === ESTADO_MOSTRAR_ACTA
          && response.datos.etapaEstadoPosicionamiento === ESTADO_GENERAR_CLASIFICADOS;
        if (response.datos.total < 0) {
          this.headers.splice(0, 6);
          this.filters.splice(2, 4);
        }
        if (response.datos.etapaTipo === 'NACIONAL') {
          this.headers.splice(2, 2);
          this.filters.splice(4, 2);
          if (this.rol === 'COMITE_DEPARTAMENTAL') {
            this.filters.splice(2, 1);
            this.filters.splice(3, 5);
          } else if (this.rol === 'ADMINISTRADOR') {
            this.filters.splice(4, 2);
          }
        }
        if (response.datos.etapaTipo === 'DEPARTAMENTAL') {
          this.headers.splice(3, 1);
          if (this.rol === 'COMITE_DEPARTAMENTAL') {
            this.filters.splice(2, 1);
            this.filters.splice(3, 2);
          } else if (this.rol === 'ADMINISTRADOR') {
            this.filters.splice(5, 1);
          }
          this.idDepartamento = response.datos.filas[0]?.id_departamento;
        }
        if (response.datos.etapaTipo === 'DISTRITAL') {
          if (this.rol === 'COMITE_DEPARTAMENTAL') {
            this.filters.splice(2, 1);
            this.filters.splice(3, 1);
          }
          this.idDepartamento = response.datos.filas[0]?.id_departamento;
        }
      } else {
        this.headers.splice(0, 6);
        this.filters.splice(2, 4);
      }
      this.showCrudTable = true;
      this.updateList();
      this.mostrar = true;
    },

    verMedallero(medallero, metodo) {
      this.metodo = metodo;
      this.medallero = medallero;
      this.dialog = !this.dialog;
    },

    async generarActa() {
      const query = {
        idArea: this.idArea,
        idDepartamento: this.idDepartamento ? this.idDepartamento : '',
      };
      const response = await this.$service.list(
        `medallero/etapa/${this.etapaSeleccionada.id}/acta`,
        query,
        []
      );
      if (response.isOK) {
        const linkSource = `data:application/pdf;base64,${response.datos}`;
        const downloadLink = document.createElement('a');
        const fileName = 'Acta.pdf';
        downloadLink.href = linkSource;
        downloadLink.download = fileName;
        downloadLink.click();
      } else {
        this.$message.error(
          response.message ?? response.mensaje ?? 'Error al generar el Acta'
        );
      }
    },

    definirHeaders() {
      return [
        {
          text: 'Área',
          align: 'center',
          value: 'area',
          sortable: false,
        },
        {
          text: 'Grado Escolaridad',
          align: 'center',
          value: 'grado_escolar',
          sortable: false,
        },
        {
          text: 'Departamento',
          align: 'center',
          value: 'departamento',
          sortable: false,
        },
        {
          text: 'Distrito',
          align: 'center',
          value: 'distrito',
          sortable: false,
        },
        {
          text: 'Estado',
          align: 'center',
          value: 'estado_medallero',
          sortable: false,
        },
        {
          text: 'Acciones',
          divider: false,
          sortable: false,
          align: 'center',
          value: 'ACTIONS',
        },
      ];
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
          values: this.olimpiadas.map((olimpiada) => ({
            text: olimpiada.nombre,
            value: olimpiada.id,
          })),
        },
        {
          field: 'idEtapa',
          type: 'array',
          init: this.idEtapaSeleccionada,
          multiple: false,
          label: 'Etapas',
          eventName: 'cambioEtapas',
          onChange: this.actualizarEtapa,
          values: this.etapas.map((etapa) => ({
            text: `${etapa.nombre} - ${etapa.estado}`,
            value: etapa.id,
          })),
        },
        {
          field: 'area',
          type: 'text',
          label: 'Área',
          typeG: 'String',
        },
        {
          field: 'grado',
          type: 'text',
          label: 'Grado Escolaridad',
          typeG: 'String',
        },
        {
          field: 'departamento',
          type: 'text',
          label: 'Departamento',
          typeG: 'String',
        },
        {
          field: 'distrito',
          type: 'text',
          label: 'Distrito',
          typeG: 'String',
        },
      ];
    },
  },
  computed: {
    nombreArchivo() {
      return 'Medallero';
    },
  },
};
</script>
