import { useTenantRoles } from "@/src/hooks/use-tenant-roles";
import { usePaymentTypes } from "@/src/hooks/use-payment-types";
import { useContractPeriodsForType } from "@/src/hooks/use-contract-periods";
import { useRegions } from "@/src/hooks/use-regions";
import { useCities } from "@/src/hooks/use-cities";
import { useUnitTypes } from "@/src/hooks/use-unit-types";
import { useUnitUsages } from "@/src/hooks/use-unit-usages";
import { usePropertyTypes } from "@/src/hooks/use-property-types";
import { usePropertyUsages } from "@/src/hooks/use-property-usages";
import {
  getOrderAddressStep,
  resolveOrderContractTypeKey,
} from "@/src/lib/order-detail-steps";

export function resolveOrderContractType(orderData) {
  return resolveOrderContractTypeKey(orderData);
}

export function useResolvedSelectOptions(field, orderData, formValues) {
  const contractType = resolveOrderContractType(orderData) || "housing";

  const needsTenantRoles =
    field?.optionsSource === "tenant-roles" || field?.key === "tenant_role_id";
  const needsPaymentTypes =
    field?.optionsSource === "payment-types" || field?.key === "payment_type_id";
  const needsContractPeriods =
    field?.optionsSource === "contract-periods" ||
    field?.key === "contract_term_in_years" ||
    field?.key === "contract_period_id";
  const needsRegions =
    field?.optionsSource === "regions" || field?.key === "property_place_id";
  const needsCities =
    field?.optionsSource === "cities" || field?.key === "property_city_id";
  const needsUnitTypes =
    field?.optionsSource === "unit-types" || field?.key === "unit_type_id";
  const needsUnitUsages =
    field?.optionsSource === "unit-usages" || field?.key === "unit_usage_id";
  const needsPropertyTypes =
    field?.optionsSource === "property-types" || field?.key === "property_type_id";
  const needsPropertyUsages =
    field?.optionsSource === "property-usages" || field?.key === "property_usages_id";

  const address = getOrderAddressStep(orderData);
  const regionId =
    formValues?.property_place_id ??
    address?.property_place_id ??
    orderData?.property_place_id ??
    null;

  const { options: tenantOptions, isLoading: tenantLoading } = useTenantRoles(needsTenantRoles);
  const { options: paymentOptions, isLoading: paymentLoading } = usePaymentTypes(
    contractType,
    needsPaymentTypes
  );
  const { options: periodOptions, isLoading: periodsLoading } = useContractPeriodsForType(
    contractType,
    { enabled: needsContractPeriods }
  );
  const { options: regionOptions, isLoading: regionsLoading } = useRegions(needsRegions);
  const { options: cityOptions, isLoading: citiesLoading } = useCities({
    enabled: needsCities,
    regionId: needsCities ? regionId : null,
  });
  const { options: unitTypeOptions, isLoading: unitTypesLoading } = useUnitTypes(
    contractType,
    needsUnitTypes
  );
  const { options: unitUsageOptions, isLoading: unitUsagesLoading } = useUnitUsages(
    contractType,
    needsUnitUsages
  );
  const { options: propertyTypeOptions, isLoading: propertyTypesLoading } = usePropertyTypes(
    contractType,
    needsPropertyTypes
  );
  const { options: propertyUsageOptions, isLoading: propertyUsagesLoading } = usePropertyUsages(
    contractType,
    needsPropertyUsages
  );

  if (Array.isArray(field?.options) && field.options.length > 0) {
    return { options: field.options, isLoading: false };
  }

  if (needsTenantRoles) return { options: tenantOptions, isLoading: tenantLoading };
  if (needsPaymentTypes) return { options: paymentOptions, isLoading: paymentLoading };
  if (needsContractPeriods) return { options: periodOptions, isLoading: periodsLoading };
  if (needsRegions) return { options: regionOptions, isLoading: regionsLoading };
  if (needsCities) return { options: cityOptions, isLoading: citiesLoading };
  if (needsUnitTypes) return { options: unitTypeOptions, isLoading: unitTypesLoading };
  if (needsUnitUsages) return { options: unitUsageOptions, isLoading: unitUsagesLoading };
  if (needsPropertyTypes) return { options: propertyTypeOptions, isLoading: propertyTypesLoading };
  if (needsPropertyUsages) {
    return { options: propertyUsageOptions, isLoading: propertyUsagesLoading };
  }

  return { options: field?.options ?? [], isLoading: false };
}
