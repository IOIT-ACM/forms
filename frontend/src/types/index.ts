/**
 * Represents the specific type of a question.
 * Derived from the `QUESTION_TYPES` choices in `apps/form_builder/models.py`.
 */
export type QuestionType =
  | 'short_answer'
  | 'paragraph'
  | 'multiple_choice'
  | 'single_choice'
  | 'dropdown'
  | 'file_upload'
  | 'linear_scale'
  | 'rating'
  | 'multiple_choice_grid'
  | 'date'
  | 'time';

/**
 * Represents the type of a conditional logic rule.
 * Derived from `QuestionCondition` model in `apps/form_builder/models.py`.
 */
export type ConditionType = 'show_if' | 'hide_if';

/**
 * Represents a selectable option for questions like 'multiple_choice', 'single_choice', or 'dropdown'.
 * Corresponds to the `PublicQuestionOptionSerializer`.
 */
export interface QuestionOption {
  label: string;
  value: string;
  is_other_option: boolean;
}

/**
 * Represents a row in a 'multiple_choice_grid' question.
 * Corresponds to the `PublicGridRowSerializer`.
 */
export interface GridRow {
  label: string;
  value: string;
}

/**
 * Represents a column in a 'multiple_choice_grid' question.
 * Corresponds to the `PublicGridColumnSerializer`.
 */
export interface GridColumn {
  label: string;
  value: string;
}

/**
 * Represents a conditional logic rule that determines if a question is shown or hidden.
 * Corresponds to the `PublicQuestionConditionSerializer`.
 */
export interface QuestionCondition {
  /** The `identifier` of the question this condition depends on. */
  depends_on_question: string;
  /** The value(s) that trigger the condition. Can be a single value or an array. */
  trigger_value: any;
  condition_type: ConditionType;
}

/**
 * Represents a single question within the form.
 * Corresponds to the `PublicQuestionSerializer`.
 * Optional fields are omitted from the JSON if they are empty/null.
 */
export interface Question {
  /** A unique, URL-friendly identifier for the question within the form. */
  identifier: string;
  type: QuestionType;
  question_text: string;
  description_text?: string;
  is_required: boolean;
  /** A JSON object for client-side validation (e.g., { "maxLength": 100 }). */
  validation_rules?: Record<string, any>;
  /** A JSON object for type-specific settings (e.g., { "min": 1, "max": 5 }). */
  question_config?: Record<string, any>;
  options?: QuestionOption[];
  grid_rows?: GridRow[];
  grid_columns?: GridColumn[];
  conditions?: QuestionCondition[];
}

/**
 * Represents the entire form schema returned by the public API.
 * This is the main type for the API response.
 * Corresponds to the `PublicFormSerializer`.
 */
export interface FormSchema {
  title: string;
  description: string | null;
  deadline: string | null; // ISO 8601 date-time string
  confirmation_message: string | null;
  questions: Question[];
}

/**
 * Represents the structure of an error or message response from the API,
 * which occurs if the form is inactive, past its deadline, etc.
 */
export interface FormMessage {
    title: string;
    description: string | null;
    message: string;
}

export interface LandingPageEvent {
  id: string;
  col: number;
  row: number;
  x: number;
  y: number;
  width: number;
  height: number;
  imgSrc: string;
  title: string;
  itemNum: number;
}