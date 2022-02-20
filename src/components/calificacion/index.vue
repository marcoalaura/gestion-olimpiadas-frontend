<template>
  <div>
    <v-card elevation="0">
      <crud-table
          :headers="headers"
          description="Reporte de pruebas"
          :url.sync="url"
          :widthModal="500"
          :show-filter-init="true"
          :filters.sync="filters"
          v-if="ready"
          :custom="true"
          :show-filter-options="false"
          :omitir-carga-on-mounted="false"
      >
        <template slot="buttons">
          <v-icon-tooltip
              color="primary"
              :disabled="!idEtapaSeleccionada || !idOlimpiadaSeleccionada"
              icon="table_chart"
              @accion="$store.commit('openModal', 5)"
              text="Ver avance porcentual por departamento"
          />
          <v-icon-tooltip
              color="primary"
              :disabled="!idEtapaSeleccionada || !idOlimpiadaSeleccionada"
              icon="download"
              @accion="descargarReporte()"
              text="Descargar Reporte"
          />
        </template>
                <v-tooltip bottom color="primary">
        <template v-slot:activator="{ on }">
          <v-btn icon :small="['xs', 'sm'].includes($vuetify.breakpoint.name)"
          @click.native="$store.commit('openModal', 5)" class="primary--text btn-filter" v-on="on" :disabled="!idEtapaSeleccionada || !idOlimpiadaSeleccionada">
            <v-icon-component icon="table_chart" color="primary"/>
          </v-btn>
        </template>
        <span> Ver avance porcentual por departamento </span>
      </v-tooltip>

        <template slot="items" slot-scope="items">
          <tr>
            <td>{{ items.items.unidadEducativa }}</td>
            <td>{{ items.items.codigoSie }}</td>
            <td>{{ items.items.area }}</td>
            <td>{{ items.items.gradoEscolar }}</td>
            <td>{{ items.items.cantidadInscritos }}</td>
            <td>{{ items.items.cantidadOnline }}</td>
            <td>{{ items.items.cantidadOffline }}</td>
            <td>{{ items.items.examenesFinalizados }}</td>
            <td>
              <v-progress-linear
                :value="parseFloat(items.items.porcentaje)"
                color="primary"
                height="25"
                dark
              >
                <template v-slot:default="{ value }">
                  <strong>{{ value }}%</strong>
                </template>
              </v-progress-linear>
            </td>
          </tr>
        </template>
      </crud-table>
    </v-card>
    <v-dialog v-model="$store.state.modal5" persistent :width="1200">
      <Reporte/>
    </v-dialog>
  </div>
</template>
<script>
import CrudTable from '@/plugins/crud-table/CrudTable.vue';
import actions from '@/plugins/crud-table/mixins/crud-table';
import vIconComponent from '../../plugins/icon/index.vue';
import Reporte from '../etapas/Reporte.vue';

export default {
  mixins: [actions],
  computed: {
  },
  data: () => ({
    reporte: false,
    search: '',
    vall: 11.22,
    ready: false,
    headers: [
      {
        text: 'Unidad Educativa',
        value: 'unidadEducativa',
        sortable: false,
      },
      {
        text: 'Codigo SIE',
        value: 'codigoSie',
        sortable: false,
      },
      {
        text: 'Area',
        value: 'area',
        sortable: false,
      },
      {
        text: 'Año de escolaridad',
        value: 'gradoEscolar',
        sortable: false,
      },
      {
        text: 'Cantidad de inscritos',
        value: 'cantidadInscritos',
        sortable: false,
      },
      {
        text: 'Cantidad Online',
        value: 'cantidadOnline',
        sortable: false,
      },
      {
        text: 'Cantidad Offline',
        value: 'cantidadOffline',
        sortable: false,
      },
      {
        text: 'Total Finalizados',
        value: 'examenesFinalizados',
        sortable: false,
      },
      {
        text: 'Porcentaje',
        value: 'porcentaje',
        sortable: false,
      },
    ],
    items: [],
    etapaSeleccionada: null,
    olimpiadaSeleccionada: null,
    idOlimpiadaSeleccionada: null,
    idEtapaSeleccionada: null,
    etapas: [],
    olimpiadas: [],
    url: '',
    filters: null,
  }),
  async mounted() {
    this.etapaSeleccionada = this.$storage.get('etapaSeleccionada');
    this.olimpiadaSeleccionada = this.$storage.get('olimpiadaSeleccionada');
    this.olimpiadaSeleccionada = this.$storage.get('olimpiadaSeleccionada');
    if (this.olimpiadaSeleccionada !== null) {
      this.idOlimpiadaSeleccionada = this.olimpiadaSeleccionada.id;
    } else {
      this.idOlimpiadaSeleccionada = null;
    }
    await this.loadParams();
    this.filters = this.definirFiltros();
    this.ready = true;
  },
  methods: {
    obtenerRuta() {
      return `calificaciones/etapas/${this.idEtapaSeleccionada}`;
    },
    async descargarReporte() {
      if (this.idOlimpiadaSeleccionada && this.idEtapaSeleccionada) {
        this.$waiting(true, 'Generando reporte');
        const datosReporte = await this.$service.get(`${this.obtenerRuta()}?filtro=csv:true`);
        if (datosReporte.finalizado) {
          const worksheet = this.XLSX.utils.json_to_sheet(datosReporte.datos.filas);
          const workbook = this.XLSX.utils.book_new();
          this.XLSX.utils.book_append_sheet(workbook, worksheet, 'SheetJS');
          const wopts = {
            bookType: 'ods',
            bookSST: false,
          };
          this.XLSX.writeFile(workbook, `${this.olimpiadaSeleccionada ? this.olimpiadaSeleccionada.nombre : ''}-Reporte-por-unidad-educativa-Etapa-${this.etapaSeleccionada ? this.etapaSeleccionada.nombre : ''}.ods`, wopts);
          this.$waiting(false);
        } else {
          this.$message.warning('No se pudo generar el reporte');
        }
      } else {
        this.$message.warning('Seleccione la olimpiada y la etapa');
      }
    },
    async actualizarEtapa(idEtapaSeleccionadaNueva) {
      this.etapaSeleccionada = this.etapas.find(item => item.id === idEtapaSeleccionadaNueva);
      this.idEtapaSeleccionada = idEtapaSeleccionadaNueva;
      this.$storage.set('etapaSeleccionada', this.etapaSeleccionada);
      this.$storage.set('areaSeleccionada', null);

      this.areaSeleccionada = null;
      this.idAreaSeleccionada = null;

      this.filters = this.definirFiltros();
      this.url = this.obtenerRuta();

      setTimeout(() => {
        this.updateList();
      }, 100);
    },

    async cargarEtapas() {
      try {
        if (this.olimpiadaSeleccionada) {
          const resultado = await this.$service.get(`olimpiadas/${this.olimpiadaSeleccionada.id}/etapas`);
          if (resultado && resultado.isOK) {
            this.etapas = resultado && resultado.datos && resultado.datos.filas ? resultado.datos.filas : [];
            if (this.idEtapaSeleccionada) {
              const updateEtapa = this.etapas.find(item => item.id === this.idEtapaSeleccionada);
              this.etapaSeleccionada = updateEtapa;
              this.$storage.set('etapaSeleccionada', updateEtapa);
            }
          } else {
            this.etapas = [];
          }
        }
      } catch (error) {
        this.$message.error(error.message);
      }
    },
    async loadParams() {
      try {
        const olimpiadas = await this.$service.get('olimpiadas');
        if (olimpiadas && olimpiadas.isOK) {
          this.olimpiadas = olimpiadas && olimpiadas.datos && olimpiadas.datos.filas
            ? olimpiadas.datos.filas
            : [];
        }

        if (this.olimpiadas.length > 0) {
          this.idOlimpiadaSeleccionada = this.olimpiadas.length > 0 ? this.olimpiadas[0].id : null;
          this.olimpiadaSeleccionada = this.olimpiadas.length > 0 ? this.olimpiadas[0] : null;
          this.$storage.set('olimpiadaSeleccionada', this.olimpiadas.length > 0 ? this.olimpiadas[0] : null);

          const areas = await this.$service.get('areas');
          if (areas && areas.isOK) {
            this.areas = areas && areas.datos && areas.datos.filas ? areas.datos.filas : [];
          }

          const gradosEscolares = await this.$service.get('grados-escolares?limite=50&pagina=1');
          if (gradosEscolares && gradosEscolares.isOK) {
            this.gradosEscolares = gradosEscolares && gradosEscolares.datos && gradosEscolares.datos.filas ? gradosEscolares.datos.filas : [];
          }
        } else {
          this.etapas = [];
          this.idEtapaSeleccionada = null;
          this.idOlimpiadaSeleccionada = null;
          this.olimpiadaSeleccionada = null;
          this.$storage.set('olimpiadaSeleccionada', null);
          this.$storage.set('etapaSeleccionada', null);
          this.$storage.set('areaSeleccionada', null);
        }
        await this.cargarEtapas();
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
          eventName: 'cambioEtapas',
          onChange: this.actualizarEtapa,
          values: this.etapas.map(etapa => ({
            text: `${etapa.nombre} - ${etapa.estado}`,
            value: etapa.id
          })),
        },
        {
          field: 'unidadEducativa',
          type: 'text',
          clear: true,
          label: 'Unidad Educativa',
        }
      ];
    },
    async actualizarOlimpiada(idOlimpiadaSeleccionadaNueva) {
      this.olimpiadaSeleccionada = this.olimpiadas.find(item => item.id === idOlimpiadaSeleccionadaNueva);
      this.idOlimpiadaSeleccionada = idOlimpiadaSeleccionadaNueva;
      if (this.olimpiadaSeleccionada != null) {
        this.$storage.set('olimpiadaSeleccionada', this.olimpiadaSeleccionada);
      }
      this.$storage.set('etapaSeleccionada', null);
      await this.cargarEtapas();
      this.idEtapaSeleccionada = null;
      this.filters = this.definirFiltros();
      this.url = this.obtenerRuta();

      setTimeout(() => {
        this.updateList();
      }, 100);
    },
  },
  components: {
    vIconComponent,
    Reporte,
    CrudTable
  }
};
</script>
