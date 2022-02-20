<template>
  <v-card elevation="0">
    <app-dialog
      :dialog="modal"
      :titulo="titulo"
      @open-dialog="modal = true"
      @close-dialog="modal = false"
      @accion="save"
      max-width="900"
      textoEjecutar="Guardar"
      icono="military_tech"
      :opciones-desactivadas="opcionesDesactivadas"
    >
      <v-card elevation="1">
        <v-card-text>
          Etapa: {{ medalleroCabecera.e_tipo }}<br />
          Área: {{ medalleroCabecera.a_nombre }}<br />
          Año de Escolaridad: {{ medalleroCabecera.ge_nombre }}
        </v-card-text>
      </v-card>
      <v-simple-table fixed-header ref="table">
        <template v-slot:default>
          <thead>
            <tr>
              <th class="text-center">Rude</th>
              <th class="text-center">Unidad Educativa</th>
              <th class="text-center">
                Puesto
                <v-tooltip
                  bottom
                  color="primary"
                  v-if="posicionesRurales.length > 0"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-icon color="primary" dark v-bind="attrs" v-on="on">
                      leaderboard
                    </v-icon>
                  </template>
                  <span v-for="(posicion, i) in posicionesRurales" :key="i">
                    <strong>Puestos Rurales</strong><br />
                    Posición Máxima: {{ posicion.posicionMaxima }}<br />
                    Posición Mínima: {{ posicion.posicionMinima }}<br />
                    Nota Mínima: {{ posicion.notaMinima }}<br />
                    <v-divider></v-divider>
                  </span>
                </v-tooltip>
              </th>
              <th class="text-center">Galardón</th>
              <th class="text-center">Puntaje</th>
              <th class="text-center">Tiempo Examen</th>
              <th class="text-center">Estado</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in posicionesMedallero"
              :key="item.index"
              @mouseover="getDatos(item)"
            >
              <td>
                <v-tooltip
                  bottom
                  color="red"
                  v-if="
                    (item.cambio == 1 || item.cambio == 2) && metodo == 'editar'
                  "
                >
                  <template v-slot:activator="{ on }">
                    <v-btn
                      icon
                      small
                      v-on="on"
                      color="red"
                      @click.stop="cambioPosicion(item, 'bajar')"
                    >
                      <v-icon-component
                        :size="21"
                        icon="south"
                      ></v-icon-component>
                    </v-btn>
                  </template>
                  <span>Bajar</span>
                </v-tooltip>

                <v-tooltip
                  bottom
                  color="green"
                  v-if="
                    (item.cambio == 2 || item.cambio == 3) && metodo == 'editar'
                  "
                >
                  <template v-slot:activator="{ on }">
                    <v-btn
                      icon
                      small
                      v-on="on"
                      color="green"
                      @click.stop="cambioPosicion(item, 'subir')"
                    >
                      <v-icon-component
                        :size="21"
                        icon="north"
                      ></v-icon-component>
                    </v-btn>
                  </template>
                  <span>Subir</span>
                </v-tooltip>
                {{ item.e_rude }}<br />
                <small class="primary--text"
                  >{{ item.p_tipo_documento }}: {{ item.p_nro_documento }}</small
                >
              </td>
              <td>
                {{ item.ue_nombre }}<br />
                <small class="primary--text"
                  >Área: {{ item.ue_area_geografica }}</small
                >
              </td>
              <td class="text-center">
                <v-avatar color="secondary" size="36">
                  <span class="white--text text-h5">{{
                    item.m_orden_galardon
                  }}</span>
                </v-avatar>
              </td>
              <td>{{ item.m_denominativo }}</td>
              <td class="text-center">{{ item.ee_puntaje }}</td>
              <td class="text-center">{{ msATiempo(item.milisegundos) }}</td>
              <td v-if="item.empates == 0" class="green--text">DEFINIDO</td>
              <td v-else class="red--text">EMPATE</td>
            </tr>
          </tbody>
        </template>
      </v-simple-table>
    </app-dialog>
  </v-card>
</template>
<script>
import AppDialog from '@/plugins/modal/AppDialog.vue';
import vIconComponent from '@/plugins/icon/index.vue';

export default {
  components: {
    AppDialog,
    vIconComponent,
  },
  props: {
    dialog: {
      default: false,
    },
    medallero: {},
    metodo: {
      default: 'ver',
    },
  },
  data: () => ({
    url: 'medallero/comiteDepartamental',
    filaNro: 0,
    modal: false,
    opcionesDesactivadas: true,
    posicionesRurales: null,
    posicionesMedallero: null,
    medalleroCabecera: {
      a_nombre: null,
      e_tipo: null,
      ge_nombre: null,
      o_sigla: null,
      e_id: null,
    },
  }),
  methods: {
    async save() {
      const datos = {
        idEtapa: null,
        posiciones: [],
      };
      datos.idEtapa = this.medalleroCabecera.e_id;
      for (const posicion of this.posicionesMedallero) {
        if (posicion.empates !== 0) {
          datos.posiciones.push({
            idInscripcion: posicion.i_id,
            idMedallero: posicion.m_id,
          });
        }
      }
      const message = '¿Está seguro de realizar los cambios de posición al medallero?, una vez realizado no podrá modificar.';
      this.$confirm(message, async () => {
        const response = await this.$service.patch(this.url, datos);
        if (response.isOK) {
          this.$message.success(response.mensaje);
          this.$emit('actualizarLista');
          this.modal = false;
        } else {
          this.$message.error(
            response.mensaje
              ?? response.message
              ?? 'Error al realizar el cambio de posición al medallero'
          );
        }
      });
    },
    getDatos(datos) {
      for (let index = 0; index < this.posicionesMedallero.length; index++) {
        this.posicionesMedallero[index].cambio = 0;
      }
      if (datos.empates !== 0) {
        const { empates } = datos;
        for (const empate of empates) {
          for (
            let index = 0;
            index < this.posicionesMedallero.length;
            index++
          ) {
            if (empate.index === index) {
              if (index === empates[0].index) {
                this.posicionesMedallero[index].cambio = 1;
              } else if (index === empates[empates.length - 1].index) {
                this.posicionesMedallero[index].cambio = 3;
              } else {
                this.posicionesMedallero[index].cambio = 2;
              }
            }
          }
        }
      }
    },
    cambioPosicion(item, opcion) {
      const indexActual = this.posicionesMedallero.indexOf(item);
      const { empates } = item;
      const indexActualEnEmpate = empates.findIndex(
        (m) => m.index === indexActual
      );
      const exist = opcion === 'subir'
        ? empates[indexActualEnEmpate - 1]
        : empates[indexActualEnEmpate + 1];
      if (exist) {
        const id = item.m_id;
        const mDenominativo = item.m_denominativo;
        const mOrdenGalardon = item.m_orden_galardon;
        const indexCambio = exist.index;
        const guardarDesplazado = this.posicionesMedallero[indexCambio];

        this.posicionesMedallero[indexCambio] = item;
        this.posicionesMedallero[indexCambio].m_id = guardarDesplazado.m_id;
        this.posicionesMedallero[indexCambio].m_denominativo = guardarDesplazado.m_denominativo;
        this.posicionesMedallero[indexCambio].m_orden_galardon = guardarDesplazado.m_orden_galardon;
        this.posicionesMedallero[indexActual] = guardarDesplazado;
        this.posicionesMedallero[indexActual].m_id = id;
        this.posicionesMedallero[indexActual].m_denominativo = mDenominativo;
        this.posicionesMedallero[indexActual].m_orden_galardon = mOrdenGalardon;
        this.$refs.table.$forceUpdate();
      }
    },
    msATiempo(milisegundos) {
      let segundos = Math.floor((milisegundos / 1000) % 60);
      let minutos = Math.floor((milisegundos / (1000 * 60)) % 60);
      let horas = Math.floor((milisegundos / (1000 * 60 * 60)) % 24);

      horas = horas < 10 ? '0' + horas : horas;
      minutos = minutos < 10 ? '0' + minutos : minutos;
      segundos = segundos < 10 ? '0' + segundos : segundos;

      return horas + ':' + minutos + ':' + segundos;
    },
  },
  watch: {
    async dialog() {
      this.filaNro = 0;
      this.modal = false;

      this.opcionesDesactivadas = this.metodo === 'ver';
      const query = {
        idDepartamento: this.medallero.id_departamento
          ? this.medallero.id_departamento
          : '',
        idDistrito: this.medallero.id_distrito
          ? this.medallero.id_distrito
          : '',
      };
      const response = await this.$service.list(
        `medallero/etapaAreaGrado/${this.medallero.id_etapa_area_grado}`,
        query,
        []
      );
      if (response.isOK) {
        this.posicionesMedallero = response.datos.posicionesMedallero;
        this.medalleroCabecera = response.datos.medalleroCabecera;
        this.posicionesRurales = response.datos.medalleroPosicionRural;
        this.modal = true;
      } else {
        this.$message.error(
          response.message ?? response.mensaje ?? 'Error al generar medalleros'
        );
      }
    },
  },
  computed: {
    titulo() {
      return this.medalleroCabecera.o_sigla;
    },
  },
};
</script>
