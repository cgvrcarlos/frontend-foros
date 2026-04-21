// ─── Auth ────────────────────────────────────────────────────────────────────

export type Genero = 'MASCULINO' | 'FEMENINO' | 'OTRO' | 'NO_DICE';
export type GradoEstudios = 'PRIMARIA' | 'SECUNDARIA' | 'PREPARATORIA' | 'LICENCIATURA' | 'POSGRADO' | 'OTRO';
export type SituacionLaboral = 'ESTUDIANTE' | 'EMPLEADO' | 'AUTOEMPLEADO' | 'DESEMPLEADO' | 'OTRO';
export type Role = 'ADMIN' | 'PONENTE' | 'ASISTENTE' | 'STAFF';

export interface User {
  id: string;
  email: string;
  nombre?: string;  // Account-level nombre (from unified account)
  nombres: string;  // UserProfile-level nombres
  apaterno: string;
  amaterno: string;
roles: Role[];
  telefono?: string | null;
  redesSociales?: string | null;
  calle?: string | null;
  colonia?: string | null;
  cp?: string | null;
  municipio?: string | null;
  genero?: Genero | null;
  ocupacion?: string | null;
  gradoEstudios?: GradoEstudios | null;
  escuela?: string | null;
  situacionLaboral?: SituacionLaboral | null;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  user: User;
}

export interface RegisterDto {
  password: string;
  apaterno: string;
  amaterno: string;
  nombres: string;
  email: string;
  telefono: string;
  redesSociales?: string;
  calle: string;
  colonia: string;
  cp: string;
  municipio: string;
  genero: Genero;
  ocupacion: string;
  gradoEstudios: GradoEstudios;
  escuela?: string;
  situacionLaboral: SituacionLaboral;
}

// ─── Eventos ─────────────────────────────────────────────────────────────────

export interface Ponencia {
  id: string;
  lugar: string;
  horaInicio: string;
  horaFin: string;
  orden: number;
  ponente: { nombre: string };
}

export interface PonenciaAdmin {
  id: string;
titulo: string;
  descripcion?: string | null;
  lugar: string;
  horaInicio: string;
  horaFin: string;
  orden: number;
  ponenteId: string;
  ponente: { nombre: string };
}

export type TipoPregunta = 'OPCION_UNICA' | 'MULTIPLE' | 'ESCALA' | 'ABIERTA_CORTO' | 'ABIERTA_LARGO';
export type SeccionPregunta = 'ANALISIS' | 'PROPUESTAS';

export interface Pregunta {
  id: string;
  texto: string;
  tipo: TipoPregunta;
  seccion: SeccionPregunta;
  esRequerida: boolean;
  orden: number;
  opciones: string[];
  escalaMin?: number | null;
  escalaMax?: number | null;
}

export interface Survey {
  id: string;
  titulo: string;
  eventId: string;
  questions: Pregunta[];
}

export interface Evento {
  id: string;
  titulo: string;
  descripcion?: string | null;
  fechaHora: string;
  linkVirtual?: string | null;
  ubicacionPresencial?: string | null;
  publicado: boolean;
  eliminado?: boolean;
  ponencias?: Ponencia[];
  survey?: Survey | null;
}

// ─── Attendance ───────────────────────────────────────────────────────────────

export type TipoAsistencia = 'PRESENCIAL' | 'VIRTUAL';
export type AttendanceStatus = 'CONFIRMADO' | 'ASISTIO' | 'NO_ASISTIO';

export interface MyAttendance {
  id: string;
  qrCode: string;
  status: AttendanceStatus;
  tipoAsistencia: TipoAsistencia;
  confirmedAt: string;
  verifiedAt: string | null;
  event: {
    id: string;
    titulo: string;
    fechaHora: string;
    ubicacionPresencial?: string | null;
    linkVirtual?: string | null;
  };
}

export interface AnswerItem {
  questionId: string;
  answer: string | string[];
}

export interface ConfirmAttendanceDto {
  eventId: string;
  tipoAsistencia: TipoAsistencia;
  answers?: AnswerItem[];
}

export interface AttendanceResponse {
  id: string;
  qrCode: string;
  tipoAsistencia: TipoAsistencia;
  confirmedAt: string;
  event?: { titulo: string };
  user?: { nombres: string; email: string };
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export interface Stats {
  totalUsuarios: number;
  totalEventos: number;
  totalAsistencias: number;
  totalPonentes: number;
}

export interface VerifiedTimelineBucket {
  hour: string;
  count: number;
}

export interface EventStats {
  evento: { id: string; titulo: string; fechaHora: string } | null;
  totalConfirmados: number;
  confirmadosPresenciales: number;
  confirmadosVirtuales: number;
  asistioCount: number;
  noAsistioCount: number;
  confirmadoPendiente: number;
  tasaAsistencia: number;
  totalRespuestas: number;
  verifiedTimeline: VerifiedTimelineBucket[];
}

export interface PonenteAdmin {
  id: string;
  nombre: string;
  bio?: string | null;
  email: string;
  _count?: { ponencias: number };
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UserAdmin {
  id: string;
  apaterno: string;
  amaterno: string;
  nombres: string;
  email: string;
  telefono?: string | null;
  genero?: string | null;
  ocupacion?: string | null;
  gradoEstudios?: string | null;
  situacionLaboral?: string | null;
  createdAt: string;
}
