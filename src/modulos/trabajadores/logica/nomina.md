#cargos

Administrador
Descripción: Administra y gestiona los recursos y operación de Polleria Montiel
horario: no definido
valor hora normal: 30
valor hora extra: 35

Procesador
Descripción: Procesa pollos vivos a canal.
horario: 4:00 am - 02:00 pm
valor hora normal: 24
valor hora extra: 28

Tablajero
Descripción: Atiende y procesa pedidos de mostrador y domicilio, se encarga del despiece de los canales y su mantenimiento. 
horario: 06:30 am - 04:00 pm
valor hora normal: 27
valor hora extra: 31


Cajero
Descripción: Registra las ventas y transacciones, asegurando un seguimiento del flujo de caja. Atiende y gestiona los pedidos a domicilio.
horario: 06:30 am - 04:00 pm
valor hora normal: 25
valor hora extra: 29

Repartidor
Descripción: Entrega los pedidos de pollos a las direcciones indicadas por los clientes. Ayuda de manera general en la operación del local 17.
horario: 06:30 am - 04:00 pm
valor hora normal: 25
valor hora extra: 30


#Bonos
se otorgan de manera diaria. si el trabajador cumple con las condiciones de algún bono, entonces se añade al pago diario calculado, si el bono se maneja por 'recompensas', se añade un punto al día corriente, al fin de la semana se podrá cobrar las recompensas según los puntos acumulados. Los puntos no pueden acumularse de una semana a otra. 

Producción
Condición: Se otorga a los trabajadores que completan todas sus tareas asignadas del día y mantienen asistencia y puntualidad.
Monto diario: 25

Ventas
Condición: Se otorga a los trabajadores que superan su promedio personal de ventas en los últimos 5 días. Si no hay historial, el bono se otorga si sus ventas superan el 80% del promedio del equipo.
Monto diario: 25


Eficiencia
Condición: Se otorga a los trabajadores que completan sus tareas en el tiempo estimado o antes, con calidad y sin retrabajos.
Puntos diarios: 1
Recompensas: 
2 Puntos: Puede cambiar su día de descanso asignado.
3 Puntos: Puede salir 30 min antes, con autorización del encargado. (Los 30 min se cuentan como trabajados).
6 Puntos: Puede salir 1 hora antes, con autorización del encargado. (Los 60 min se cuentan como trabajados)."

Desempeño
Condición: Se otorga a los trabajadores que destacan en su área con un desempeño excepcional, mostrando iniciativa, trabajo en equipo y compromiso con la calidad.
Puntos diarios: 1
Recompensas:
2 Puntos = 1kg Surtida
4 Puntos = 1 Pechuga Completa (0.8 - 1.0kg) sin limite en la personalizacion del corte
6 Puntos = 1 Pollo Completo (1.9 a 2.2 kg) sin limite en la personalizacion del producto"

#Dia de descanso pagado
el dia de descanso es proporcional a los días trabajados, es decir 1 día de descanso pagado cada 6 días trabajados. 

El dia de descanso no contempla horas extra, por lo que su valor se calcula de la siguiente manera: ['valor hora normal' * 'max horas normales']. Ejecuto cálculos para cada cargo:

Administrador 
240 = 30 * 8

Procesador
192 = 24 * 8

Tablajero
216 = 27 * 8

Cajero
200 = 25 * 8

Repartidor
200 = 25 * 8

Ahora bien, si el trabajador solamente trabajó 5 días(de la semana corriente), el valor del 'dia de descanso' se ajustará de manera proporcional. Ej. Procesador:
'valor diario del dia de descanso pagado' = 32.00 //(192 / 6)
'valor dia de descanso pagado ajustado a 5 días trabajados' =  160.00 // (32 * 5)
