<template>
  <v-card elevation="0">
    <v-card-title class="ma-0 pa-1">
      <v-container fluid>
        <v-row no-gutters class="justify-space-between">
          <div
            :cols="11"
            class="d-flex flex-row align-center text-sm color1--tex primary--text"
          >
            <v-icon-component class="m-2" icon="summarize"></v-icon-component>
            <span class="fs10 pl-2 font-weight-medium">
              {{ $vuetify.breakpoint.name !== 'xs' ? 'Reporte porcentual de estudiantes que dieron el examen' : 'Reporte porcentual'}}
            </span>
          </div>
          <div>
            <v-icon-tooltip
              color="primary"
              icon="close"
              text="Cerrar ventana emergente"
              @accion="$store.commit('closeModal', 5)"
            />
          </div>
        </v-row>
      </v-container>
    </v-card-title>
    <v-spacer/>
    <v-card elevation="0" width="100%" class="pb-4 pl-4 pr-4">
      <table class="reporte__estudiantes">
        <thead>
          <th></th>
          <th></th>
          <template v-for="(item, i) in cronograma.columnas">
            <th class="width" :key="i">{{ item }}</th>
            <th class="space" v-if="i !== cronograma.columnas.length - 1" :key="i + 1000"></th>
          </template>
        </thead>
        <tbody>
          <template v-for="(item, i) in cronograma.filas">
            <tr :key="i">
              <td>{{ item.area }}</td>
              <td class="d-flex flex-row align-center justify-center">
                <v-icon-component icon="wifi_off" className="error--text"/>
                <span class="error--text">Offline</span>
              </td>
              <template v-for="(dep, i) in Object.keys(item.resultado)">
                <td :key="i">
                  <v-progress-linear
                    :value="item.resultado[dep].offline"
                    height="20"
                    :color="getClass(item.resultado[dep].offline)"
                  >
                    <strong :class="getColor(item.resultado[dep].offline)">{{ Math.ceil(item.resultado[dep].offline) }}%</strong>
                  </v-progress-linear>
                </td>
                <td :key="i + 1000" v-if="i !== cronograma.columnas.length - 1"></td>
              </template>
            </tr>
            <tr :key="i + 2000">
              <td>{{ item.area }}</td>
              <td class="d-flex flex-row align-center justify-center">
                <v-icon-component icon="wifi" className="success--text"/>
                <span class="success--text">Online</span>
              </td>
              <template v-for="(dep, i) in Object.keys(item.resultado)">
                <td :key="i">
                  <v-progress-linear
                    :value="item.resultado[dep].online"
                    height="20"
                    :color="getClass(item.resultado[dep].online)"
                  >
                    <strong :class="getColor(item.resultado[dep].online)">{{ item.resultado[dep].online }}%</strong>
                  </v-progress-linear>
                </td>
                <td :key="i + 1000" v-if="i !== cronograma.columnas.length - 1"></td>
              </template>
            </tr>
            <tr :key="i + 3000">
              <td colspan="19">
                <v-divider class="mt-2 mb-2"></v-divider>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
      <v-row>
        <v-col cols="12" class="mb-0 pb-0">
        </v-col>
      </v-row>
    </v-card>
    <v-card elevation="0" class="d-flex flex-row align-center justify-end" v-if="nextStep">
      <v-btn color="primary" outlined class="ma-3 mt-0 fs8 mr-2" @click="nextStepHR">
        Avanzar al siguiente estado
        <v-icon-component icon="arrow_forward" className="mr-0 pr-0"></v-icon-component>
      </v-btn>
    </v-card>
  </v-card>
</template>
<script>

import vIconComponent from '@/plugins/icon/index.vue';

export default {
  props: {
    nextStep: {
      type: Boolean,
      default: false
    },
    iTmp: {
      type: Object,
      default: () => {}
    }
  },
  components: {
    vIconComponent
  },
  data: () => ({
    cronograma: {}
  }),
  mounted () {
    this.$nextTick(async () => {
      await this.resultadoCronograma();
    });
  },
  methods: {
    nextStepHR () {
      this.$confirm(this.iTmp.message, async () => {
        this.$emit('updateEtapa', this.iTmp);
        this.$store.commit('closeModal', 5);
      }, () => {}, 'SI ESTOY SEGURO', 'CANCELAR');
    },
    async resultadoCronograma () {
      try {
        const id = this.iTmp ? this.iTmp.id : this.$storage.get('etapaSeleccionada').id;
        const cronograma = await this.$service.get(`examenesOffline/olimpiada/${this.$storage.get('olimpiadaSeleccionada').id}/etapa/${id}/resultadoCronograma`);
        this.cronograma = cronograma.datos;
      } catch (error) {
        this.$message.error(error.message);
      }
    },
    getClass (percentage) {
      let str = '';
      if (percentage > 70) {
        str = 'primary backgroundColor--text';
      } else if (percentage >= 50) {
        str = 'success fontColor--text';
      } else if (percentage > 30) {
        str = 'warning fontColor--text';
      } else {
        str = 'error fontColor--text';
      }
      return str;
    },
    getColor (percentage) {
      let str = '';
      if (percentage > 70) {
        str = 'backgroundColor--text';
      } else if (percentage >= 50) {
        str = 'backgroundColor--text';
      } else if (percentage > 30) {
        str = 'fontColor--text';
      } else {
        str = 'fontColor--text';
      }
      return str;
    },
  }
};
</script>
<style lang="scss" scoped>
.reporte__estudiantes {
  width: 100%;
  thead {
    .width {
      width: 100px;
    }
    .space {
      width: 5px;
    }
    th {
      padding-bottom: 15px;
    }
  }
  tr {
    td {
      text-align: center;
    }
  }
}
</style>
