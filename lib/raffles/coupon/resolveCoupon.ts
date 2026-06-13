export interface CouponResult {

  found: boolean

  id?: string

  code?: string

  discountType?: "fixed" | "percentage"

  discountValue?: number

  discountAmount?: number

}

export async function resolveCoupon(

  couponCode?: string | null,

  subtotal?: number

): Promise<CouponResult> {

  if (!couponCode) {

    return {

      found: false

    }

  }

  /*
    Próximamente consultará:

    raffles.coupons

    raffles.coupon_rules

    raffles.coupon_redemptions
  */

  return {

    found: false

  }

}