import React from 'react';
import { Modal, View, Text, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { T, serif, sans } from '../ui';

/* Política de privacidad embebida (Apple 5.1.1 y Google User Data exigen que sea
   accesible dentro de la app). La versión web para las fichas de tienda vive en
   app-docs/legal/ y se publica cuando exista el dominio. */

const S = ({ t, children }: { t: string; children: React.ReactNode }) => (
  <View style={{ gap: 6 }}>
    <Text style={{ fontFamily: serif(600), fontSize: 17, color: T.ink }}>{t}</Text>
    <Text style={{ fontFamily: sans(500), fontSize: 13.5, color: T.body, lineHeight: 20 }}>{children}</Text>
  </View>
);

export default function Privacidad({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: '#F6F3EB', paddingTop: insets.top }}>
        <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: insets.bottom + 96, gap: 18 }}>
          <Text style={{ fontFamily: serif(600), fontSize: 28, color: T.ink }}>Política de privacidad</Text>
          <Text style={{ fontFamily: sans(600), fontSize: 12.5, color: T.muted }}>Belysh · Última actualización: 12 de julio de 2026</Text>

          <S t="Quiénes somos">
            Belysh es un salón de belleza en Lima, Perú. Esta política explica qué datos recogemos
            cuando usas nuestra app y para qué los usamos.
          </S>
          <S t="Datos que recogemos">
            Al crear tu cuenta: nombre, correo electrónico y, si decides darlos, teléfono y fecha de
            nacimiento (solo para tu bono de cumpleaños). Al usar la app: tus reservas (servicio,
            estilista, fecha y hora), tus puntos del Belysh Club y los pagos que registras en el salón
            (método y montos; nunca guardamos datos de tarjetas). Si entras como invitada solo se crea
            un identificador anónimo.
          </S>
          <S t="Para qué los usamos">
            Para gestionar tus citas, tu programa de fidelidad y recordarte tus reservas. No vendemos
            tus datos ni los compartimos con terceros para publicidad.
          </S>
          <S t="Dónde se guardan">
            En Supabase, nuestro proveedor de base de datos, con servidores en Estados Unidos y
            cifrado en tránsito. El acceso está protegido por reglas que solo te permiten ver tu
            propia información.
          </S>
          <S t="Permisos del dispositivo">
            Calendario: solo si tocas “Añadir al calendario”, para guardar tu cita. Notificaciones:
            para recordatorios de tus reservas. Puedes revocarlos en los ajustes del sistema.
          </S>
          <S t="Cuánto tiempo los conservamos">
            Mientras tu cuenta exista. Si la eliminas, tu perfil, citas y puntos se borran de forma
            permanente; los registros de pagos ya confirmados se conservan sin ningún dato que te
            identifique (obligación contable).
          </S>
          <S t="Eliminar tu cuenta">
            Puedes eliminar tu cuenta y todos tus datos desde la propia app: Perfil → Eliminar
            cuenta. El borrado es inmediato e irreversible.
          </S>
          <S t="Tus derechos">
            Conforme a la Ley N.º 29733 de Protección de Datos Personales del Perú, puedes acceder,
            rectificar o eliminar tus datos, y oponerte a su tratamiento. Escríbenos y te
            responderemos lo antes posible.
          </S>
          <S t="Contacto">
            avancecorp26@gmail.com
          </S>
        </ScrollView>

        <View style={{ position: 'absolute', left: 24, right: 24, bottom: insets.bottom + 20 }}>
          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Cerrar"
            style={({ pressed }) => [{
              borderRadius: 999, backgroundColor: T.ink, alignItems: 'center', paddingVertical: 16,
              opacity: pressed ? 0.9 : 1,
            }]}
          >
            <Text style={{ fontFamily: sans(600), fontSize: 14, color: '#fff' }}>Cerrar</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
