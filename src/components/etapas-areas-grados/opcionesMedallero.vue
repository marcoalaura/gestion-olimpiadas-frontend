<template>
  <v-card elevation="0">
    <v-row>
      <v-col v-if="!rural" cols="10" md="6" xs="10" sm="10" lg="6">
        <v-text-field
            color="primary"
            required
            :rules="$validate(['required', 'alfanumerico'])"
            v-model="subGrupo"
            @change="sendOption()"
            label="Grupo"
            hint="Oro"
            outlined
            dense
        />
      </v-col>
      <v-col v-if="!rural" cols="10" md="6" xs="10" sm="10" lg="6">
        <v-text-field
            color="primary"
            required
            :rules="$validate(['required', 'alfanumerico'])"
            v-model="denominativo"
            @change="sendOption()"
            label="Denominación"
            hint="Ej, Oro 1"
            outlined
            dense
        />
      </v-col>
      <v-col v-if="rural" cols="12" md="6" xs="9" sm="9" lg="4">
        <v-input-text-field

            label="Posición máxima"
        >
          <template slot="contenido">
            <v-text-field
                class="mx-4 mt-1"
                color="primary"
                required
                :rules="$validate(['required', 'numeros']).concat([rules.posicionMaxima(posicionMaxima, posicionMinima)])"
                v-model="posicionMaxima"
                @blur="sendOptionRural()"
                type="number"
                outlined
                dense
                @keyup="validacionTotalPosicionesMaxima()"
                oninput="if(this.value <= 0) this.value = ''; this.value = parseInt(this.value)  + 1 ; this.value = parseInt(this.value) - 1"
            />
          </template>
        </v-input-text-field>
      </v-col>
      <v-col v-if="rural" cols="12" md="6" xs="9" sm="" lg="4">
        <v-input-text-field

            label="Posición mínima"
        >
          <template slot="contenido">
            <v-text-field
                class="mx-4 mt-1"
                color="primary"
                required
                :rules="$validate(['required', 'numeros']).concat([rules.posicionMinima(posicionMinima, posicionMaxima)])"
                v-model="posicionMinima"
                @blur="sendOptionRural();"
                type="number"
                hint="Menor o igual al nro. de medalleros"
                outlined
                dense
                @keyup="validacionTotalPosicionesMinima()"
                oninput="if(this.value <= 0) this.value = '';
                  this.value = parseInt(this.value)  + 1 ;
                  this.value = parseInt(this.value) - 1;"
            />
          </template>
        </v-input-text-field>
      </v-col>
      <v-col v-if="rural" cols="12" md="6" xs="9" sm="9" lg="4">
        <v-input-text-field

            label="Nota Mínima"
        >
          <template slot="contenido">
            <v-text-field
                class="mx-4 mt-1"
                color="primary"
                :rules="$validate(['required', 'numeros'])"
                v-model="notaMinima"
                @blur="sendOptionRural()"
                type="number"
                hint="Ej, 51"
                outlined
                dense
                oninput="
                  if(this.value <= 0) this.value = '';
                  if(this.value > 100) this.value = '100';
                  this.value = parseInt(this.value)  + 1 ;
                  this.value = parseInt(this.value) - 1"
                max="100"
            />
          </template>
        </v-input-text-field>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="11"></v-col>
      <v-col cols="1">
        <v-icon-tooltip v-if="showDelete"
                        color="error"
                        icon="remove_circle_outline"
                        text="Eliminar Medallero"
                        @accion="deleteOption"/>
      </v-col>
    </v-row>
  </v-card>
</template>
<script>
import validate from '@/common/mixins/validate';

const NAME = 'v-opciones-medallero';
export default {
  mixins: [validate],
  name: NAME,
  props: {
    keyInicial: {
      type: String,
    },
    setOption: {
      type: String,
    },
    id: {
      type: String
    },
    value: {
      type: String,
      default: null
    },
    showDelete: {
      type: Boolean,
      default: false
    },
    rural: {
      type: Boolean,
      default: false
    },
    textoInicial: {
      type: String,
      default: null
    },
    ordenGalardonInicial: {
      type: String,
      default: null
    },
    denominativoInicial: {
      type: String,
      default: null
    },
    subGrupoInicial: {
      type: String,
      default: null
    },
    ordenInicial: {
      type: String,
      default: null
    },
    totalMedalleros: {
      type: Number,
      default: 0
    },
    minimoInicial: null,
    maximoInicial: null,
    notaMinimaInicial: null,
  },
  data: () => ({
    clave: null,
    texto: null,
    ordenGalardon: 0,
    denominativo: null,
    subGrupo: null,
    orden: 0,
    posicionMinima: null,
    posicionMaxima: null,
    notaMinima: null,
    rules: {
      posicionMinima(posicionMinima, posicionMaxima) {
        return !posicionMaxima || !posicionMinima || (parseInt(posicionMinima, 10) >= parseInt(posicionMaxima, 10)) || `Debe ser mayor o igual a la posición ${posicionMaxima}`;
      },
      posicionMaxima(posicionMaxima, posicionMinima) {
        return !posicionMaxima || !posicionMinima || (parseInt(posicionMaxima, 10) <= parseInt(posicionMinima, 10)) || `Debe ser menor o igual a la posición ${posicionMinima}`;
      },
      posicionMaximaRural(valor, nroTotalDeMedalleros) {
        return !valor || parseInt(valor, 10) <= nroTotalDeMedalleros || `Debe ser menor o igual al nro de medalleros: ${nroTotalDeMedalleros}`;
      },
    }
  }),
  mounted() {
    this.$nextTick(() => {
      this.key = this.keyInicial;
      this.texto = this.textoInicial;
      this.ordenGalardon = this.ordenGalardonInicial;
      this.denominativo = this.denominativoInicial;
      this.subGrupo = this.subGrupoInicial;
      this.orden = this.ordenInicial ?? 0;
      this.posicionMinima = this.minimoInicial;
      this.posicionMaxima = this.maximoInicial;
      this.notaMinima = this.notaMinimaInicial;

      if (this.rural) {
        this.sendOptionRural();
      } else {
        this.sendOption();
      }
    });
  },
  methods: {
    deleteOption() {
      this.$confirm('¿Esta seguro de eliminar el medallero?', () => {
        this.$emit('deleteOption', this.clave);
      });
    },
    getOption() {
      return this.text;
    },
    sendOption() {
      this.$emit('setOption', {
        key: this.key,
        id: this.id,
        text: this.texto,
        ordenGalardon: this.ordenGalardon,
        denominativo: this.denominativo,
        subGrupo: this.subGrupo,
        orden: this.orden,
        posicionMinima: this.posicionMinima,
        posicionMaxima: this.posicionMaxima,
        notaMinima: this.notaMinima
      });
    },
    sendOptionRural() {
      this.$emit('setOptionRural', {
        key: this.key,
        id: this.id,
        text: this.texto,
        ordenGalardon: this.ordenGalardon,
        denominativo: this.texto,
        subGrupo: this.subGrupo,
        orden: this.orden,
        posicionMinima: this.posicionMinima,
        posicionMaxima: this.posicionMaxima,
        notaMinima: this.notaMinima
      });
    },
    validacionTotalPosicionesMaxima() {
      if (this.posicionMaxima > parseInt(this.totalMedalleros)) {
        this.posicionMaxima = this.totalMedalleros;
        this.$message.error(`Máximo valor Nro de medalleros: ${this.totalMedalleros}`);
      }
    },
    validacionTotalPosicionesMinima() {
      if (this.posicionMinima > parseInt(this.totalMedalleros)) {
        this.posicionMinima = this.totalMedalleros;
        this.$message.error(`Máximo valor Nro de medalleros: ${this.totalMedalleros}`);
      }
    }
  },
  components: {}
};
</script>
<style lang="scss">

</style>
