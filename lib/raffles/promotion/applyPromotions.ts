import {

PromotionContext,
PromotionResult

} from "./promotionTypes"

export async function applyPromotions(

context: PromotionContext

): Promise<PromotionResult> {

let bonusQuantity = 0

let discount = 0

/*
==================================================

BUSINESS RULE ENGINE

Por ahora utiliza reglas internas.

En la siguiente etapa consultará:

- raffles.business_rules

y soportará:

- Coupons

- Bundles

- Promotions

- Buy X Get Y

- Percentage Discount

- Fixed Discount

sin modificar el Quote Engine.

==================================================
*/

if (context.quantity >= 10) {

bonusQuantity = 5

}

else if (context.quantity >= 5) {

bonusQuantity = 2

}

return {

applied:
bonusQuantity > 0 || discount > 0,

promotionId:
bonusQuantity > 0
? "AUTO_BONUS"
: undefined,

promotionCode:
bonusQuantity > 0
? "BUY_MORE"
: undefined,

promotionName:
bonusQuantity > 0
? "Compra más y recibe tickets adicionales"
: undefined,

bonusQuantity,

discount

}

}