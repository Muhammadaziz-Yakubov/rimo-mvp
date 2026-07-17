export interface MultiLang {
  en?: string;
  ru?: string;
  uz?: string;
  kaa?: string;
}

export interface AuthorityCategory {
  id: number;
  code: string;
  order: number;
  active: boolean;
  title: MultiLang;
  created_at: string;
  updated_at: string;
}

export interface Authority {
  id: number;
  tin: number;
  code: string;
  order: number;
  active: boolean;
  icon_url?: string;
  category_id?: number;
  category?: AuthorityCategory;
  title: MultiLang;
  created_at: string;
  updated_at: string;
}

export interface DictionaryColumn {
  name: string;
  type: string;
  length?: number;
  min?: number;
  max?: number;
  required: boolean;
  default?: string;
}

export interface Dictionary {
  id: number;
  code: string;
  status: string;
  parent_id_type: string;
  creator_id: string;
  title: MultiLang;
  columns: DictionaryColumn[];
  created_at: string;
  updated_at: string;
}

export interface ReportDeadline {
  id: number;
  code: string;
  day: number;
  order: number;
  active: boolean;
  title: MultiLang;
  created_at: string;
  updated_at: string;
}

export interface ReportPeriodicity {
  id: number;
  code: string;
  month: number;
  order: number;
  active: boolean;
  title: MultiLang;
  created_at: string;
  updated_at: string;
}

export interface ReportVersion {
  id: number;
  report_id: number;
  code: string;
  title: MultiLang;
  is_actual: boolean;
  is_blocked_to_reapply: boolean;
  submit_task_api_type: string;
  approving_group_ids: number[];
  created_at: string;
  updated_at: string;
  deactivated_at?: string;
  activated_at?: string;
}

export interface Sphere {
  id: number;
  code: string;
  order: number;
  active: boolean;
  icon_url?: string;
  title: MultiLang;
  description: MultiLang;
  created_at: string;
  updated_at: string;
}

export interface Report {
  id: number;
  code: string;
  order: number;
  rate: number;
  elements_count: number;
  fill_time: number;
  deadline_lock_enabled: boolean;
  is_favorite: boolean;
  authority_id: number;
  authority?: Authority;
  main_sphere_id: number;
  main_sphere?: Sphere;
  sphere_id: number;
  sphere?: Sphere;
  report_deadline_id: number;
  report_deadline?: ReportDeadline;
  report_periodicity_id: number;
  report_periodicity?: ReportPeriodicity;
  report_status: string;
  name: MultiLang;
  title: MultiLang;
  short_title: MultiLang;
  description: MultiLang;
  detail_info: MultiLang;
  contacts: MultiLang;
  legal_basis: MultiLang;
  deadline_notice_text: MultiLang;
  deadline_locked_text: MultiLang;
  deactivated: MultiLang;
  deadline_windows: string[];
  next_available_period: string;
  video_link?: string;
  report_versions: ReportVersion[];
  created_at: string;
  updated_at: string;
  deactivated_at?: string;
  activated_at?: string;
}

export interface Task {
  id: number;
  report_id: number;
  report_code: string;
  report_version_id: number;
  report_version_code: string;
  authority_id: number;
  authority_code: string;
  status: string; // draft, submitted, processing, rejected, etc.
  source: string;
  user_type: string;
  user_uuid: string;
  owner_pin: string;
  owner_tin: string;
  currentNodeId?: number;
  currentNodeCode?: string;
  previousNodeId?: number;
  previousNodeCode?: string;
  title: MultiLang;
  short_title: MultiLang;
  submitted_at?: string;
  last_updated_at: string;
  created_at: string;
  updated_at: string;
}

export type ActionFieldType =
  | "Label"
  | "LabelHeader"
  | "LabelHtml"
  | "InputString"
  | "InputStringLabel"
  | "InputInteger"
  | "InputIntegerLabel"
  | "InputFloat"
  | "InputFloatLabel"
  | "FileUpload"
  | "MultipleFileUpload"
  | "Select"
  | "SelectLabel"
  | "DatePicker"
  | "DatePickerLabel"
  | "InputSearch"
  | "InputSearchLabel"
  | "TextArea"
  | "TextAreaLabel"
  | "Checkbox"
  | "CheckboxLabel"
  | "VerifyWithEds";

export interface TaskActionField {
  id: number;
  node_id: number;
  action_id: number;
  report_version_id: number;
  code: string;
  type: ActionFieldType;
  colspan: number;
  rowspan: number;
  coordinate_x: number;
  coordinate_y: number;
  is_required: boolean;
  is_disabled: boolean;
  is_hidden: boolean;
  default_value?: string;
  value?: string;
  comment?: string;
  has_comment: boolean;
  field_comment?: string;
  placeholder: MultiLang;
  title: MultiLang;
  description: MultiLang;
  label: Record<string, string>;
  options?: string; // stringified choices or config
  rules?: string; // validation rules config (regex, bounds)
  style?: string;
  taxonomy_code?: string;
  taxonomy_data?: Record<string, string>;
  created_at: string;
  updated_at: string;
}

export interface TaskAction {
  id: number;
  node_id: number;
  report_version_id: number;
  next_node_id: number;
  code: string;
  type: "action" | "form" | "table" | "repeatable_table";
  order: number;
  title: MultiLang;
  short_title: MultiLang;
  description: MultiLang;
  repeated_rows: number[];
  fields: TaskActionField[];
  created_at: string;
  updated_at: string;
}

export interface TaskNode {
  id: number;
  report_version_id: number;
  approving_group_id: number;
  group_number: number;
  order: number;
  code: string;
  type: string; // e.g. start_condition
  title: MultiLang;
  short_title: MultiLang;
  description: MultiLang;
  javascript_code?: string;
  actions: TaskAction[];
  created_at: string;
  updated_at: string;
}

export interface TaskLogUser {
  fullname: string;
}

export interface TaskFlowLog {
  id: number;
  task_id: number;
  node_from_id: number;
  node_to_id: number;
  node_type: string;
  report_id: number;
  report_version_id: number;
  approving_group_id: number;
  authority_id: number;
  action_id: number;
  status_from: string;
  status_to: string;
  source: string;
  user_uuid: string;
  user_ip: string;
  user_agent: string;
  user: TaskLogUser;
  node: TaskNode;
  body?: Record<string, any>;
  created_at: string;
}

export interface FlowStructured {
  id: number;
  report_id: number;
  report_code: string;
  report_version_id: number;
  report_version_code: string;
  authority_id: number;
  authority_code: string;
  owner_pin: string;
  owner_tin: string;
  currentNodeId: number;
  currentNodeCode: string;
  previousNodeId?: number;
  previousNodeCode?: string;
  status: string;
  source: string;
  user_type: string;
  user_uuid: string;
  title: MultiLang;
  short_title: MultiLang;
  submitted_at?: string;
  last_updated_at: string;
  created_at: string;
  updated_at: string;
  authority: Authority;
  report: Report;
  current_node: TaskNode;
  logs: TaskFlowLog[];
  user: {
    pin: string;
    profile: string;
    uuid: string;
  };
}

export interface MeCredential {
  id: string;
  username: string;
  user_type: string;
  status: string;
  expires_at: string;
}

export interface MeJuridical {
  uuid: string;
  tin: number;
  name: string;
}

export interface UserProfileActivityInfo {
  qqs_number?: string;
  rating?: string;
  tax_type?: string;
  capital?: string;
  numbers?: number;
}

export interface UserProfileBankInfo {
  code?: number;
  name?: string;
  number?: string;
  okonx?: number;
}

export interface UserProfileContactInfo {
  address?: string;
  email?: string;
  phone?: string;
  soato_code?: number;
}

export interface UserProfile {
  pin: string;
  passport?: string;
  firstname: string;
  surname: string;
  middlename?: string;
  fullname: string;
  birth_date?: string;
  birth_place?: string;
  birth_country?: string;
  birth_country_id?: number;
  citizenship?: string;
  citizenship_id?: number;
  nationality?: string;
  nationality_id?: number;
  sex?: string;
  valid?: string;
  live_status?: number;
  activity_info?: UserProfileActivityInfo;
  bank_info?: UserProfileBankInfo;
  contact_info?: UserProfileContactInfo;
}

export interface UserMe {
  uuid: string;
  pin: string;
  status: string;
  credential: MeCredential;
  juridical?: MeJuridical;
  authority?: {
    id: number;
    code: string;
    title: MultiLang;
  };
  user: {
    pin: string;
    status: string;
    uuid: string;
    profile: UserProfile;
  };
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  refresh_expires_in: number;
  token_type: string;
}

export interface SubmitResponse {
  task_id: number;
  status: string;
  next_node_id: number;
  task_log_id?: number;
  task_log_ids?: number[];
}
