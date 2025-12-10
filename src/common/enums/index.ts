export enum TransactionType {
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
  PAYMENT = 'payment',
  REFUND = 'refund',
}

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum PaymentProvider {
  SEPAY = 'sepay',
  MANUAL = 'manual',
}

export enum GeminiActionType {
  DESCRIBE_INTERIOR = 'describe_interior',
  DESCRIBE_MASTERPLAN = 'describe_masterplan',
  GENERATE_IMAGE = 'generate_image',
  UPSCALE = 'upscale',
  CHANGE_MATERIAL = 'change_material',
  MERGE_FURNITURE = 'merge_furniture',
  REPLACE_MODEL = 'replace_model',
  FINISH_INTERIOR = 'finish_interior',
  FINISH_EXTERIOR = 'finish_exterior',
  COLORIZE_FLOORPLAN = 'colorize_floorplan',
  CROP_TO_EDIT = 'crop_to_edit',
  INSERT_BUILDING = 'insert_building',
  KITCHEN_CABINET = 'kitchen_cabinet',
  PERSPECTIVE_SYNC = 'perspective_sync',
  CHARACTER_SYNC = 'character_sync',
  IMPROVE_RENDER = 'improve_render',
  VIRTUAL_TOUR = 'virtual_tour',
}
