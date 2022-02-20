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
      :filters.sync="filters"
      description="Reprogramación de rezagados"
      :custom="true"
      :filtro-as-query="false"
      :omitir-carga-on-mounted="true"
      >
      <template slot="buttons">
        <v-icon-tooltip
          color="primary"
          icon="thumb_up_off_alt"
          text="Habilitar todos los estudiantes"
          @accion="handleClickAllHabilitar"
        />
      </template>
      <template slot="items" slot-scope="items">
        <tr>
          <td>{{ items.items.estudiante.rude }}</td>
          <td>{{ items.items.etapaAreaGrado.area.nombre }}</td>
          <td>{{ items.items.etapaAreaGrado.gradoEscolar.nombre }}</td>
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
        text: 'Rude',
        sortable: false,
        align: 'center',
        value: 'rude'
      },
      {
        text: 'Area',
        sortable: false,
        align: 'center',
        value: 'area'
      },
      {
        text: 'Grado Escolar',
        sortable: false,
        align: 'center',
        value: 'gradoEscolar'
      }
    ],
    aOlimpiadas: [],
    aEtapas: [],
    customizedFilters: [],
    existOlimpiada: null,
    idEtapaSeleccionada: null,
    idOlimpiadaSeleccionada: null,
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
  methods: {
    handleClickAllHabilitar () {
      if (this.$storage.get('olimpiadaSeleccionada')) {
        this.$confirm('¿Esta seguro de habilitar a todos los estudiantes?', async () => {
          try {
            const response = await this.$service.post(`etapas/${this.$storage.get('etapaSeleccionada').id}/rezagados?idOlimpiada=${this.$storage.get('olimpiadaSeleccionada').id}`);
            if (response && response.isOK) {
              this.$message.success(response.mensaje);
              this.updateList();
            } else {
              throw new Error(response.mensaje);
            }
          } catch (error) {
            this.$message.error(error.message);
          }
        });
      } else {
        this.$message.error('No tiene olimpiadas activas');
      }
    },
    async loadData (data) {
      const keyNiveles = Object.entries(data);
      for (const [key] of keyNiveles) if (key === 'idOlimpiada') this.existOlimpiada = true;
      await this.cargarEtapas();
    },
    async handleChangeEtapa(idEtapaSeleccionadaNueva) {
      this.etapaSeleccionada = this.aEtapas.find(item => item.id === idEtapaSeleccionadaNueva);
      this.idEtapaSeleccionada = idEtapaSeleccionadaNueva;
      this.$storage.set('etapaSeleccionada', this.etapaSeleccionada);
      this.url = `etapas/${this.$storage.get('etapaSeleccionada').id}/rezagados`;
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
            this.url = `etapas/${this.$storage.get('etapaSeleccionada').id}/rezagados`;
          }
          resolve(true);
        } catch (error) {
          reject(error);
        }
      });
    },
    definirFiltros() {
      this.customizedFilters = [];
      this.url = this.$storage.get('etapaSeleccionada') ? `etapas/${this.$storage.get('etapaSeleccionada').id}/rezagados` : '';
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
