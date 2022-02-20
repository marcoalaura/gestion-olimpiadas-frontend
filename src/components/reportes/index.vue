<template>
  <div>
    <v-card elevation="0">
      <v-card-title>
        <v-card elevation="0"
          class="subtitle primary--text font-weight-regular pl-2 fs12">Reportes
        </v-card>
        </v-card-title>
        <v-container fluid class="container--filter backgroundColor">
          <v-row no-gutters>
            <v-col cols="12" lg="12" md="12" sm="12">
              <v-input-select
                @value="e => idTipoReporteSeleccionado = e"
                key="selectTipoReporte"
                color="primary"
                item-color="primary"
                v-model="idTipoReporteSeleccionado"
                :init="idTipoReporteSeleccionado"
                class="ml-2 mr-2"
                label="Seleccione el tipo de reporte"
                :items="tiposDeReportes.map(tipoReporte => ({
                    text: tipoReporte.nombre,
                    value: tipoReporte.id
                  }))"
                item-text="text"
                item-value="value"
                :style="!['xs'].includes($vuetify.breakpoint.name) ? 'width: 616px; max-width: 616px' : ''"
                outlined
                :append-icon="ICONS.arrow_drop_down"
                :rules="[(val) =>!!val || 'Debe seleccionar un tipo de reporte']"
                @change="cambiarTipoDeReporte"
                hide-details
              ></v-input-select>
            </v-col>
            <v-form lazy-validation ref="form" @submit.prevent="descargarReporte">
            <v-col cols="12" lg="12" md="12" sm="12" class="mt-3">
            <v-row no-gutters style="width: 97%">
            <v-col
                    :cols="12"
                    :class="[
                    !['xs'].includes($vuetify.breakpoint.name)
                      ? 'd-flex flex-row align-center justify-start flex-wrap'
                      : ''
                  ]">
              <v-input-select
                @value="e => idOlimpiadaSeleccionada = e"
                key="selectOlimpiada"
                color="primary"
                item-color="primary"
                v-model="idOlimpiadaSeleccionada"
                :init="idOlimpiadaSeleccionada"
                class="ml-2 mr-2 mb-1"
                :label="`Olimpiadas ${formularioPorTipodeReporte[idTipoReporteSeleccionado].includes('*gestion') ? '*': ''}`"
                :items="olimpiadas.map(olimpiada => ({
                    text: olimpiada.gestion + ' - ' + olimpiada.nombre,
                    value: olimpiada.id
                  }))"
                item-text="text"
                item-value="value"
                dense
                :style="!['xs'].includes($vuetify.breakpoint.name) ? 'width: 300px; max-width: 300px' : ''"
                outlined
                hide-details
                :append-icon="ICONS.arrow_drop_down"
                v-on:change="actualizarOlimpiada"
                :rules="[(val) => !formularioPorTipodeReporte[idTipoReporteSeleccionado].includes('*gestion') || !!val || 'Debe seleccionar gestión']"
              ></v-input-select>
              <v-input-select
                @value="e => idEtapaSeleccionada = e"
                key="selectEtapa"
                color="primary"
                item-color="primary"
                v-model="idEtapaSeleccionada"
                :label="`Etapas ${formularioPorTipodeReporte[idTipoReporteSeleccionado].includes('*etapa') ? '*': ''}`"
                :init="idEtapaSeleccionada"
                class="ml-2 mr-2 mb-1"
                :items="etapas.map(etapa => ({
                  text: `${etapa.nombre} - ${etapa.estado}`,
                  value: etapa.id
                }))"
                item-text="text"
                item-value="value"
                dense
                :style="!['xs'].includes($vuetify.breakpoint.name) ? 'width: 300px; max-width: 300px' : ''"
                outlined
                hide-details
                :append-icon="ICONS.arrow_drop_down"
                v-on:change="actualizarEtapa"
                :rules="[(val) => !formularioPorTipodeReporte[idTipoReporteSeleccionado].includes('*etapa') || !!val || 'Debe seleccionar etapa']"
              ></v-input-select>
              <v-input-select
                @value="e => idAreaSeleccionada = e"
                key="selectArea"
                color="primary"
                item-color="primary"
                v-model="idAreaSeleccionada"
                :init="idAreaSeleccionada"
                class="ml-2 mr-2 mb-1"
                :label="`Área ${formularioPorTipodeReporte[idTipoReporteSeleccionado].includes('*area') ? '*': ''}`"
                :items="areas.map(area => ({
                    text: area.nombre,
                    value: area.id
                  }))"
                item-text="text"
                item-value="value"
                :style="!['xs'].includes($vuetify.breakpoint.name) ? 'width: 300px; max-width: 300px' : ''"
                dense
                outlined
                hide-details
                :disabled="!['*area', 'area'].some(r => formularioPorTipodeReporte[idTipoReporteSeleccionado].includes(r))"
                :rules="[(val) => !formularioPorTipodeReporte[idTipoReporteSeleccionado].includes('*area') || !!val || 'Debe seleccionar área']"
                :append-icon="ICONS.arrow_drop_down"
              ></v-input-select>
              <v-input-select
                @value="e => idGradoSeleccionado = e"
                key="selectGrado"
                color="primary"
                item-color="primary"
                v-model="idGradoSeleccionado"
                :init="idGradoSeleccionado"
                class="ml-2 mr-2 mb-1"
                :label="`Año escolaridad ${formularioPorTipodeReporte[idTipoReporteSeleccionado].includes('*grado') ? '*': ''}`"
                :items="grados.map(grado => ({
                    text: grado.nombre,
                    value: grado.id
                  }))"
                item-text="text"
                item-value="value"
                :style="!['xs'].includes($vuetify.breakpoint.name) ? 'width: 300px; max-width: 300px' : ''"
                dense
                outlined
                hide-details
                :disabled="!['*grado', 'grado'].some(r => formularioPorTipodeReporte[idTipoReporteSeleccionado].includes(r))"
                :rules="[(val) => !formularioPorTipodeReporte[idTipoReporteSeleccionado].includes('*grado') || !!val || 'Debe seleccionar año escolaridad']"
                :append-icon="ICONS.arrow_drop_down"
              ></v-input-select>
              <v-input-select
                @value="e => idDepartamentoSeleccionado = e"
                key="selectDepto"
                color="primary"
                item-color="primary"
                v-model="idDepartamentoSeleccionado"
                :init="idDepartamentoSeleccionado"
                class="ml-2 mr-2 mb-1"
                :label="`Departamento ${formularioPorTipodeReporte[idTipoReporteSeleccionado].includes('*departamentos') ? '*': ''}`"
                :items="departamentos.map(depto => ({
                    text: depto.nombre,
                    value: depto.id
                  }))"
                item-text="text"
                item-value="value"
                :style="!['xs'].includes($vuetify.breakpoint.name) ? 'width: 300px; max-width: 300px' : ''"
                dense
                outlined
                hide-details
                :disabled="!['*departamentos', 'departamentos'].some(r => formularioPorTipodeReporte[idTipoReporteSeleccionado].includes(r))"
                :rules="[(val) => !formularioPorTipodeReporte[idTipoReporteSeleccionado].includes('*departamentos') || !!val || 'Debe seleccionar departamento']"
                :append-icon="ICONS.arrow_drop_down"
                v-on:change="cargarDistritos(idDepartamentoSeleccionado)"
              ></v-input-select>
              <v-input-autocomplete
                @value="e => idDistritoSeleccionado = e"
                key="distritos"
                color="primary"
                item-color="primary"
                v-model="idDistritoSeleccionado"
                class="ml-2 mr-2 mb-1"
                :init="idDistritoSeleccionado"
                :label="`Distrito educativo ${formularioPorTipodeReporte[idTipoReporteSeleccionado].includes('*distritos') ? '*': ''}`"
                :items="distritos"
                item-text="nombre"
                item-value="id"
                dense
                :style="!['xs'].includes($vuetify.breakpoint.name) ? 'width: 300px; max-width: 300px' : ''"
                :disabled="!['*distritos', 'distritos'].some(r => formularioPorTipodeReporte[idTipoReporteSeleccionado].includes(r)) || bloqueoDistritos"
                :rules="[(val) => !formularioPorTipodeReporte[idTipoReporteSeleccionado].includes('*distritos') || !!val || 'Debe seleccionar distrito']"
                outlined
                hide-details
                :append-icon="ICONS.search"
                :values="distritos"
              ></v-input-autocomplete>
              <v-input-select
                @value="e => formatoDescarga = e"
                key="selectTipoDescarga"
                color="primary"
                item-color="primary"
                v-model="formatoDescarga"
                :init="formatoDescarga"
                class="ml-2 mr-2 mb-1"
                label="Formato * "
                :items="[
                    {
                      text: 'ods',
                      value: 'ods'
                    },
                    {
                      text: 'pdf',
                      value: 'pdf'
                    },
                  ]"
                item-text="text"
                item-value="value"
                :style="!['xs'].includes($vuetify.breakpoint.name) ? 'width: 300px; max-width: 300px' : ''"
                :rules="[(val) => !!val || 'Debe seleccionar formato de descarga']"
                dense
                outlined
                hide-details
                :append-icon="ICONS.arrow_drop_down"
                v-on:change="archivoVisualizarJPG = null; archivoVisualizarPDF = null"
              ></v-input-select>
            </v-col>
            <v-col cols="2" lg="2" md="2" sm="12"
                            :class="[
                !['xs'].includes($vuetify.breakpoint.name)
                  ? 'd-flex flex-row align-center justify-start flex-wrap'
                  : ''
              ]">
              <v-btn
                  class="ml-2 mr-2 mb-1 mt-8"
                  color="info"
                  block
                  :style="!['xs'].includes($vuetify.breakpoint.name) ? 'width: 300px; max-width: 300px' : ''"
                  outlined
                  type="submit"
                  ref="botonGenerar"
                >
                  Generar reporte
                  <template v-slot:loader>
                      Generando ...
                    <span class="custom-loader">
                      <v-icon light>cached</v-icon>
                    </span>
                  </template>
              </v-btn>
            </v-col>
            </v-row>
            </v-col>
            </v-form>
          </v-row>
        </v-container>
          <v-col v-if="['pdf', 'jpg'].includes(formatoDescarga)" cols="12" lg="12" md="12" sm="12"
                :class="[
                !['xs',].includes($vuetify.breakpoint.name)
                  ? 'd-flex flex-row align-center justify-start flex-wrap'
                  : ''
              ]">
            <iframe
              class="mx-5 mb-1 mt-4"
              v-if="archivoVisualizarPDF" :src="archivoVisualizarPDF" width="100%" height="720px"></iframe>
            <img
              class="mx-15 mb-1 mt-4 shadowImg"
              v-if="archivoVisualizarJPG" :src="archivoVisualizarJPG"  width="700px" max-width="900px"/>
          </v-col>
    </v-card>
  </div>
</template>
<script>
import actions from '@/plugins/crud-table/mixins/crud-table';

export default {
  mixins: [actions],
  data: () => ({
    name: '',
    url: null,
    actualizarRegistro: null,
    form: {},
    observed: null,
    areas: [],
    etapaSeleccionada: null,
    olimpiadas: [],
    etapas: [],
    departamentos: [],
    distritos: [],
    olimpiadaSeleccionada: null,
    idOlimpiadaSeleccionada: null,
    idAreaSeleccionada: null,
    idEtapaSeleccionada: null,
    idDepartamentoSeleccionado: null,
    idDistritoSeleccionado: null,
    idGradoSeleccionado: null,
    idTipoReporteSeleccionado: 'FrecuenciasYPorcentajes',
    formatoDescarga: 'ods',
    archivos: [],
    grados: [],
    archivoVisualizarPDF: null,
    archivoVisualizarJPG: null,
    bloqueoDistritos: false,
    tiposDeReportes: [
      {
        id: 'FrecuenciasYPorcentajes',
        nombre: '1. Frecuencias  y porcentajes',
      },
      {
        id: 'PromedioDeNotasPorDepartamentoYArea',
        nombre: '2. Promedio de notas por departamento y área',
      },
      {
        id: 'PromedioDeNotasPorAnioDeEscolaridadDeptoYArea',
        nombre: '3. Promedio de notas por año de escolaridad departamento y área',
      },
      {
        id: 'Preguntas',
        nombre: '4. Preguntas',
      },
      {
        id: 'Participacion',
        nombre: '5. Participación',
      },
      {
        id: 'ParticipacionPorTipoDePrueba',
        nombre: '6. Participación por tipo de prueba',
      },
      {
        id: 'Clasificados',
        nombre: '7. Clasificados',
      },
      {
        id: 'MedallerosPorArea',
        nombre: '8. Medalleros por area',
      },
      {
        id: 'MedallerosPorDepartamento',
        nombre: '9. Medalleros por departamento',
      },
    ],
    formularioPorTipodeReporte: {
      FrecuenciasYPorcentajes: [
        '*gestion',
        '*etapa',
        '*area',
        '*departamentos',
        'distritos'
      ],
      PromedioDeNotasPorDepartamentoYArea: [
        '*gestion',
        '*etapa',
      ],
      PromedioDeNotasPorAnioDeEscolaridadDeptoYArea: [
        '*gestion',
        '*etapa',
        '*departamentos',
        'distritos'
      ],
      Preguntas: [
        '*gestion',
        '*etapa',
        '*area',
        '*grado',
        '*departamentos',
        'distritos',
      ],
      Participacion: [
        '*gestion',
        '*etapa',
      ],
      ParticipacionPorTipoDePrueba: [
        '*gestion',
        '*etapa',
      ],
      Clasificados: [
        '*gestion',
        '*etapa',
      ],
      MedallerosPorArea: [
        '*gestion',
        '*etapa',
        '*departamentos',
        'distritos',
      ],
      MedallerosPorDepartamento: [
        '*gestion',
        '*etapa',
      ]
    }
  }),
  methods: {
    async actualizarOlimpiada() {
      this.olimpiadaSeleccionada = this.olimpiadas.find(item => item.id === this.idOlimpiadaSeleccionada);
      if (this.olimpiadaSeleccionada != null) {
        this.$storage.set('olimpiadaSeleccionada', this.olimpiadaSeleccionada);
      }
      this.idEtapaSeleccionada = null;
      this.$storage.set('etapaSeleccionada', null);
      await this.cargarEtapas();

      this.idAreaSeleccionada = null;
      this.$storage.set('areaSeleccionada', null);
      this.areas = [];
    },
    cambiarTipoDeReporte () {
      this.$refs.form.reset();
      this.olimpiadaSeleccionada = this.$storage.get('olimpiadaSeleccionada');
      this.idOlimpiadaSeleccionada = this.olimpiadas.id;
      this.archivoVisualizarJPG = null;
      this.archivoVisualizarPDF = null;
    },
    async cargarDistritos() {
      if (this.idDepartamentoSeleccionado === 'NACIONAL') {
        return;
      }
      this.idDistritoSeleccionado = null;
      await this.$service.get(`distritos?filtro=idDepartamento:${this.idDepartamentoSeleccionado}`)
        .then((resultado) => {
          this.distritos = resultado && resultado.datos && resultado.datos.filas ? resultado.datos.filas : [];
        });
    },
    async cargarUnidadesEducativas(idDepartamento = null, idDistrito = null) {
      if (idDepartamento || idDistrito) {
        await this.$service.get(`unidades-educativas?filtro=${idDepartamento ? 'idDepartamento:' + idDepartamento : ''}${idDistrito ? 'idDistrito:' + idDistrito : ''}`)
          .then((resultado) => {
            this.unidadesEducativas = resultado && resultado.datos && resultado.datos.filas ? resultado.datos.filas : [];
          });
      }
    },
    async actualizarEtapa() {
      this.etapaSeleccionada = this.etapas.find(item => item.id === this.idEtapaSeleccionada);
      this.$storage.set('etapaSeleccionada', this.etapaSeleccionada);
      this.$storage.set('areaSeleccionada', null);
      this.areaSeleccionada = null;
      this.idAreaSeleccionada = null;
      this.idGradoSeleccionado = null;
      await this.cargarAreas();
    },
    async cargarEtapas() {
      if (this.idOlimpiadaSeleccionada) {
        const resultado = await this.$service.get(`olimpiadas/${this.idOlimpiadaSeleccionada}/etapas`);
        if (resultado) {
          this.etapas = resultado && resultado.datos && resultado.datos.filas ? resultado.datos.filas : [];
        }
      }
    },
    async cargarAreas() {
      let resultado = [];
      if (this.idEtapaSeleccionada) {
        resultado = await this.$service.get(`etapas/${this.idEtapaSeleccionada}/etapaAreaGrados`);
        if (resultado) {
          resultado = resultado && resultado.datos && resultado.datos.filas ? resultado.datos.filas : [];
        }
      }
      this.areas = [];
      this.grados = [];
      for (const eag of resultado) {
        if (!this.areas.some(area => { area.id === eag.area.id; })) {
          this.areas.push(eag.area);
        }
        if (!this.grados.some(grado => { grado.id === eag.gradoEscolar.id; })) {
          this.grados.push(eag.gradoEscolar);
        }
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
        }
        await this.cargarEtapas();
        await this.cargarAreas();
        const resultado = await this.$service.get('grados-escolares');
        if (resultado) {
          this.gradosEscolares = resultado && resultado.datos && resultado.datos.filas ? resultado.datos.filas : [];
        }

        const departamentos = await this.$service.get('departamentos');
        if (departamentos) {
          this.departamentos = [{ codigo: 'N', id: 'NACIONAL', nombre: 'NACIONAL' }].concat(departamentos?.datos || []);
        }
      } catch (error) {
        this.$message.error(error.message);
      }
    },
    async descargarReporte () {
      if (this.$refs.form.validate()) {
        this.$waiting(true, 'Generando reporte, espere unos segundos por favor...');
        if (this.idTipoReporteSeleccionado === 'FrecuenciasYPorcentajes') {
          this.archivos = await this.$service.file('reporte/frecuencia-porcentaje' + this.getQueryParams(),
            this.formatoDescarga, this.getForceDownloadParam(this.formatoDescarga), undefined, undefined, undefined, 'ReporteFrecuenciasYPorcentajes');
        } else if (this.idTipoReporteSeleccionado === 'PromedioDeNotasPorDepartamentoYArea') {
          this.archivos = await this.$service.file('reporte/promedio/departamento-area' + this.getQueryParams(),
            this.formatoDescarga, this.getForceDownloadParam(this.formatoDescarga), undefined, undefined, undefined, 'ReportePromedioDeNotasPorDepartamentoYArea');
        } else if (this.idTipoReporteSeleccionado === 'PromedioDeNotasPorAnioDeEscolaridadDeptoYArea') {
          this.archivos = await this.$service.file('reporte/promedio/anio-escolaridad/departamento-area' + this.getQueryParams(),
            this.formatoDescarga, this.getForceDownloadParam(this.formatoDescarga), undefined, undefined, undefined, 'ReportePromedioDeNotasPorAnioDeEscolaridadDeptoYArea');
        } else if (this.idTipoReporteSeleccionado === 'Preguntas') {
          this.archivos = await this.$service.file('reporte/preguntas' + this.getQueryParams(),
            this.formatoDescarga, this.getForceDownloadParam(this.formatoDescarga), undefined, undefined, undefined, 'ReportePreguntas');
        } else if (this.idTipoReporteSeleccionado === 'Participacion') {
          this.archivos = await this.$service.file('reporte/participacion' + this.getQueryParams(),
            this.formatoDescarga, this.getForceDownloadParam(this.formatoDescarga), undefined, undefined, undefined, 'ReporteParticipacion');
        } else if (this.idTipoReporteSeleccionado === 'ParticipacionPorTipoDePrueba') {
          this.archivos = await this.$service.file('reporte/participacion/tipo-prueba' + this.getQueryParams(),
            this.formatoDescarga, this.getForceDownloadParam(this.formatoDescarga), undefined, undefined, undefined, 'ReporteParticipacionPorTipoDePrueba');
        } else if (this.idTipoReporteSeleccionado === 'Clasificados') {
          this.archivos = await this.$service.file('reporte/clasificados' + this.getQueryParams(),
            this.formatoDescarga, this.getForceDownloadParam(this.formatoDescarga), undefined, undefined, undefined, 'ReporteClasificados');
        } else if (this.idTipoReporteSeleccionado === 'MedallerosPorArea') {
          this.archivos = await this.$service.file('reporte/medalleros/area' + this.getQueryParams(),
            this.formatoDescarga, this.getForceDownloadParam(this.formatoDescarga), undefined, undefined, undefined, 'ReporteMedallerosPorArea');
        } else if (this.idTipoReporteSeleccionado === 'MedallerosPorDepartamento') {
          this.archivos = await this.$service.file('reporte/medalleros/departamento' + this.getQueryParams(),
            this.formatoDescarga, this.getForceDownloadParam(this.formatoDescarga), undefined, undefined, undefined, 'ReporteMedallerosPorDepartamento');
        }
        this.$waiting(false);
      } else {
        this.$message.error('Faltan campos que llenar');
      }
    },
    getForceDownloadParam(extension) {
      if (['ods', 'csv'].includes(extension)) {
        return true;
      }
      return false;
    },
    getQueryParams() {
      return `?format=${this.formatoDescarga}`
            + '&filtro='
            + `${this.idOlimpiadaSeleccionada ? 'idOlimpiada:' + this.idOlimpiadaSeleccionada : ''}`
            + `${this.idEtapaSeleccionada ? ',idEtapa:' + this.idEtapaSeleccionada : ''}`
            + `${this.idAreaSeleccionada ? ',idArea:' + this.idAreaSeleccionada : ''}`
            + `${this.idDepartamentoSeleccionado && this.idDepartamentoSeleccionado !== 'NACIONAL' ? ',idDepartamento:' + this.idDepartamentoSeleccionado : ''}`
            + `${this.idDistritoSeleccionado ? ',idDistrito:' + this.idDistritoSeleccionado : ''}`
            + `${this.idGradoSeleccionado ? ',idGradoEscolar:' + this.idGradoSeleccionado : ''}`;
    },
  },
  mounted() {
    this.$nextTick(async () => {
      this.etapaSeleccionada = this.$storage.get('etapaSeleccionada');
      this.olimpiadaSeleccionada = this.$storage.get('olimpiadaSeleccionada');
      if (!this.etapaSeleccionada?.id || !this.olimpiadaSeleccionada?.id) {
        this.$message.error('Debe seleccionar una olimpiada y una etapa');
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
      this.loadParams();
    });
  },
  watch: {
    archivos(val) {
      if (this.formatoDescarga === 'pdf') {
        const file = new window.Blob([val], {
          type: 'application/pdf'
        });
        const fileURL = window.URL.createObjectURL(file);
        this.archivoVisualizarPDF = fileURL;
      } else {
        this.archivoVisualizarPDF = null;
      }
      setTimeout(() => {
        const element = this.$refs.botonGenerar;
        const top = element.$el.offsetTop;
        window.scrollTo(0, top);
      }, 500);
    },
    idDepartamentoSeleccionado(val) {
      if (val === 'NACIONAL') {
        this.distritos = [];
        this.idDistritoSeleccionado = null;
        this.bloqueoDistritos = true;
      } else {
        this.bloqueoDistritos = false;
      }
    }
  }
};
</script>
