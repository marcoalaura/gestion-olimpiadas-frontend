<template>
  <v-card elevation="0">
    <v-row no-gutters>
      <v-col cols="12" class="align-center justify-center">
        <v-input-text-field

            label="Rol"
        >
          <template slot="contenido">
            <v-select
                color="primary"
                :rules="$validate(['required'])"
                item-color="primary"
                v-model="clave"
                :items="items"
                :item-disabled="rolesSeleccionados"
                @change="sendOption(false)"
                item-text="nombre"
                item-value="id"
                :tabindex="8"
                flat
                outlined
                dense
                hide-details
                name="roles"
            ></v-select>
          </template>
        </v-input-text-field>
      </v-col>
    </v-row>
  </v-card>
</template>
<script>
import validate from '@/common/mixins/validate';

const NAME = 'v-opciones-rol';
export default {
  mixins: [validate],
  name: NAME,
  props: {
    keyInicial: {
      type: String,
      default: null
    },
    id: {
      type: Number
    },
    value: {
      type: String,
      default: null
    },
    showDelete: {
      type: Boolean,
      default: false
    },
    imagen: {
      type: String,
      default: ''
    },
    roles: {
      type: Array
    },
    rolesSeleccionados: {
      type: Array
    },
  },
  methods: {
    getOption() {
      return this.text;
    },
    sendOption(eliminarSiguientes) {
      const rolFiltrado = this.roles.find(rol => rol.id === this.clave);
      this.$emit('setOption', {
        key: this.id,
        id: rolFiltrado != null ? rolFiltrado.id : null,
        text: rolFiltrado != null ? rolFiltrado.rol : null,
        campos: rolFiltrado != null ? rolFiltrado.campos : null,
        idEtapa: rolFiltrado != null ? rolFiltrado.idEtapa : null,
        idArea: rolFiltrado != null ? rolFiltrado.idArea : null,
        idDepartamento: rolFiltrado != null ? rolFiltrado.idDepartamento : null,
        idDistrito: rolFiltrado != null ? rolFiltrado.idDistrito : null,
        idUnidadEducativa: rolFiltrado != null ? rolFiltrado.idUnidadEducativa : null,
        eliminarSiguientes
      });
    },
    crearGruposRoles() {
      const gruposUnicosSet = new Map();

      this.roles.map(rol => ({
        grupo: rol.grupo
      }))
        .forEach((item) => {
          gruposUnicosSet.set(JSON.stringify(item), item);
        });

      const gruposUnicos = [...gruposUnicosSet.values()];

      const rolesFinal = [];

      gruposUnicos.forEach(grupoUnico => {
        rolesFinal.push({ header: grupoUnico.grupo });
        rolesFinal.push(...this.roles.filter(rol => rol.grupo === grupoUnico.grupo));
        rolesFinal.push({ divider: true });
      });

      return rolesFinal;
    }
  },
  data: () => ({
    clave: null,
    texto: null,
    items: []
  }),
  watch: {
    keyInicial(value) {
      this.clave = value;
      this.sendOption(false);
    },
    value(value) {
      this.text = value;
      this.sendOption(false);
    },
    roles() {
      this.items = this.crearGruposRoles();
    }
  },

  mounted() {
    this.items = this.crearGruposRoles();

    this.$nextTick(() => {
      if (this.value) {
        this.text = this.value;
        this.clave = this.keyInicial;
        this.sendOption(false);
      }
    });
  },
  components: {
  }
};
</script>
<style lang="scss">

</style>
