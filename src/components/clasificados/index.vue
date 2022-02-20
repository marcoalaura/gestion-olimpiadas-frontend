<template>
  <v-card elevation="0">
    <!-- SLOT PARA EL FORMULARIO -->
    <crud-table
      v-if="showCrudTable"
      :headers="headers"
      :url.sync="url"
      :show-filter-options="false"
      :widthModal="500"
      :order="order"
      :show-filter-init="true"
      description="Clasificados"
      :filters.sync="filters"
      :custom="true"
      :filtro-as-query="false"
      :omitir-carga-on-mounted="true"
      >
      <template slot="items" slot-scope="items">
        <tr>
          <td>{{ items.items.etapaAreaGrado.area.nombre }}</td>
          <td>{{ items.items.unidadEducativa.distrito.departamento.nombre }}</td>
          <td>{{ items.items.etapaAreaGrado.gradoEscolar.nombre }}</td>
          <td>{{ items.items.estudiante.rude }}</td>
          <td>
            {{ items.items.estudiante.persona.nombres }}
            {{ items.items.estudiante.persona.primerApellido }}
            {{ items.items.estudiante.persona.segundoApellido }}
          </td>
          <td>{{ items.items.unidadEducativa.distrito.nombre }}</td>
          <td>{{ items.items.unidadEducativa.nombre }}</td>
        </tr>
      </template>
    </crud-table>
  </v-card>
</template>
<script>

import validate from '@/common/mixins/validate';
import CrudTable from '@/plugins/crud-table/CrudTable.vue';
import actions from '@/plugins/crud-table/mixins/crud-table';

export default {
  mixins: [actions, validate],
  data: () => ({
    valid: false,
    showCrudTable: null,
    url: null,
    order: ['createdAt', 'DESC'],
    headers: [
      {
        text: 'Area',
        sortable: false,
        align: 'center',
        value: 'area'
      },
      {
        text: 'Departamento',
        sortable: false,
        align: 'center',
        value: 'departamento'
      },
      {
        text: 'Año de escolaridad',
        divider: false,
        sortable: false,
        align: 'center',
        value: 'grado'
      },
      {
        text: 'Rude',
        sortable: false,
        align: 'center',
        value: 'rude'
      },
      {
        text: 'Estudiante',
        sortable: false,
        align: 'center',
        value: 'estudiante'
      },
      {
        text: 'Distrito Educativo',
        sortable: false,
        align: 'center',
        value: 'distritoEducativa'
      },
      {
        text: 'Unidad Educativa',
        divider: false,
        sortable: false,
        align: 'center',
        value: 'unidadEducativa'
      }
    ],
    departamentos: [],
    unidadesEducativas: [],
    aOlimpiadas: [],
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
    filters: []
  }),
  mounted() {
    this.$nextTick(async () => {
      // Verificar permiso para crear
      if (this.$Casbin && this.$Casbin.enforcer) {
        const { rol } = this.$storage.get('rol');
        this.btnAgregar = await this.$Casbin.enforcer.enforce(rol, '/distritos', 'create');
        this.btnEditar = await this.$Casbin.enforcer.enforce(rol, '/distritos', 'update');
        this.btnEliminar = await this.$Casbin.enforcer.enforce(rol, '/distritos', 'delete');
      }
      const nivel = await this.$service.get('usuarios/roles');
      this.nivelUsuario = nivel.datos.nivel;
      const respuesta = await this.$service.get('olimpiadas?limite=50&pagina=1');
      this.aOlimpiadas = respuesta.datos.filas;
      this.idOlimpiadaSeleccionada = this.aOlimpiadas.length > 0 ? this.aOlimpiadas[0].id : null;
      this.$storage.set('olimpiadaSeleccionada', this.aOlimpiadas.length > 0 ? this.aOlimpiadas[0] : null);

      if (this.aOlimpiadas.length > 0) {
        const departamentos = await this.$service.get('departamentos');
        this.aDepartamentos = departamentos.datos;
        await this.loadData(this.nivelUsuario[0]);
      } else {
        this.$storage.set('olimpiadaSeleccionada', null);
        this.$storage.set('etapaSeleccionada', null);
        this.$storage.set('areaSeleccionada', null);
      }

      this.filters = this.definirFiltros();
      this.showCrudTable = true;
      setTimeout(() => {
        this.updateList();
      }, 100);
    });
  },
  computed: {
    setDisabled () {
      let state = false;
      if (['DIRECTOR'].includes(this.$storage.get('rol').rol) && this.unidadEducativaSeleccionada) state = true;
      return state;
    }
  },
  methods: {
    async loadData (data) {
      const keyNiveles = Object.entries(data);
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
      if (idDistrito) {
        await this.loadUnidadesEducativas(idDistrito);
      } else {
        this.aUnidadesEducativas = [];
        this.unidadEducativaSeleccionada = null;
        this.distritoSeleccionado = null;
        await this.loadDistritos(this.departamentoSeleccionado, '');
      }
      this.filters = this.definirFiltros();
    },
    async handelChangeUnidadEducativa (idUnidadEducativa) {
      this.unidadEducativaSeleccionada = idUnidadEducativa;
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
          if (idDistrito && this.aDistritos.length > 0) {
            this.distritoSeleccionado = idDistrito;
            const searchName = str ? `nombre:${str},` : '';
            const unidadesEducativas = await this.$service.get(`unidades-educativas?filtro=${searchName}idDistrito:${idDistrito ?? ''}`);
            this.aUnidadesEducativas = unidadesEducativas && unidadesEducativas.datos && unidadesEducativas.datos.filas ? unidadesEducativas.datos.filas : [];
            const unidadEducativaSeleccionada = this.aUnidadesEducativas.find(item => item.id === this.unidadEducativaSeleccionada);
            if (unidadEducativaSeleccionada) this.unidadEducativaSeleccionada = unidadEducativaSeleccionada.id;
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
      this.url = this.$storage.get('etapaSeleccionada') ? `clasificados/etapa/${this.$storage.get('etapaSeleccionada').id}` : null;
      if (this.existOlimpiada) {
        this.customizedFilters.push({
          field: 'idOlimpiada',
          type: 'array',
          init: this.$storage.get('olimpiadaSeleccionada').id,
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
            text: etapa.nombre,
            value: etapa.id
          })),
        });
      }

      if (this.departamentoSeleccionado || rol === 'ADMINISTRADOR') {
        this.customizedFilters.push({
          field: 'idDepartamento',
          type: 'array',
          multiple: false,
          init: this.departamentoSeleccionado,
          eventName: 'cambioDepartamento',
          onChange: this.handleChangeDep,
          disabled: this.$storage.get('rol').rol === 'TECNICO_SIE_DEPARTAMENTAL',
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
          onAutocomplete: this.searchDistritos,
          init: this.distritoSeleccionado,
          label: 'Distritos',
          values: this.aDistritos.map(departamento => ({
            text: departamento.nombre,
            value: departamento.id
          })),
        });
      }
      if (this.existUnidadEducativa || rol === 'ADMINISTRADOR') {
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
    }
  },
  components: {
    CrudTable
  }
};
</script>
<style lang="scss">
</style>
