import { CacheableObject } from '../../cache/object-cache.reducer';
import { typedObject } from '../../cache/builders/build-decorators';
import { autoserialize, deserialize } from 'cerialize';
import { HALLink } from '../../shared/hal-link.model';
import { excludeFromEquals } from '../../utilities/equals.decorators';
import { ResourceType } from '../../shared/resource-type';
import { METRICSCOMPONENT } from "./metrics-component.resource-type";

export interface MetricType {
  id: number;
  type: string;
  position: number;
}

/**
 * Describes a type of metricscomponent
 */
@typedObject
export class MetricsComponent extends CacheableObject {
  static type = METRICSCOMPONENT;

  /**
   * The object type
   */
  @excludeFromEquals
  @autoserialize
  type: ResourceType;

  /**
   * The identifier of the related Box (shortname)
   */
  @autoserialize
  id: string;

  @autoserialize
  metrics: MetricType[];

  /**
   * The {@link HALLink}s for this metricscomponent
   */
  @deserialize
  _links: {
      self: HALLink
  };
}
