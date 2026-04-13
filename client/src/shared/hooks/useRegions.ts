import { useQuery } from '@tanstack/react-query';
import { getRegions } from '../services/region.service';
import type { Region } from '../services/region.service';

export const regionQueryKeys = {
  all: ['regions'] as const,
};

export function useRegions() {
  return useQuery({
    queryKey: regionQueryKeys.all,
    queryFn: getRegions,
    staleTime: Infinity, // 지역 목록은 앱 수명 동안 불변
  });
}

/** Select 컴포넌트용 { value, label } 변환 */
export function useRegionOptions() {
  const { data, isLoading } = useRegions();

  const options =
    data?.map((r: Region) => ({
      value: r.id,
      label: `${r.name} ${r.sigungu}`,
    })) ?? [];

  return { options, isLoading };
}
