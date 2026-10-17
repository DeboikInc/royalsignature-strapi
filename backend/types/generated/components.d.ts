import type { Schema, Struct } from '@strapi/strapi';

export interface PricingSeasonPrice extends Struct.ComponentSchema {
  collectionName: 'components_pricing_season_prices';
  info: {
    displayName: 'Season Price';
  };
  attributes: {
    base_adults: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      >;
    base_children: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      >;
    base_price: Schema.Attribute.Decimal &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      >;
    priority: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    season: Schema.Attribute.Relation<'manyToOne', 'api::season.season'>;
  };
}

declare module '@strapi/strapi' {
  export namespace Public {
    export interface ComponentSchemas {
      'pricing.season-price': PricingSeasonPrice;
    }
  }
}
