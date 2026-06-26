export interface TrackingContext {

  source?: string | null

  referrer?: string | null

  /*
   * Nuevo punto único de entrada para cualquier
   * código comercial (cupón, afiliado, referido, etc.)
   */
  commercialCode?: string | null

  /*
   * Compatibilidad temporal.
   * Se eliminarán cuando toda la plataforma
   * utilice commercialCode.
   */
  affiliateCode?: string | null

  referralCode?: string | null

  couponCode?: string | null

  utm_source?: string |null

  utm_medium?: string | null

  utm_campaign?: string | null

  utm_content?: string | null

  utm_term?: string | null

  ip?: string | null

  userAgent?: string | null

}