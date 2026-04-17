import { API_BASE_URL } from '../http/baseUrl';

const DEFAULT_AVATAR = `${API_BASE_URL}/upload/defaults/profile.png`;
const DEFAULT_CLUB_LOGO = `${API_BASE_URL}/upload/defaults/club.png`;

/**
 * avatarUrl이 null/undefined이면 기본 프로필 이미지 URL을 반환한다.
 * 서버에서 반환된 상대 경로(/uploads/...)를 절대 URL로 변환한다.
 */
export function getAvatarUrl(url: string | null | undefined): string {
  if (!url) return DEFAULT_AVATAR;
  if (url.startsWith('http')) return url;
  return `${API_BASE_URL}${url}`;
}

/**
 * logoUrl이 null/undefined이면 기본 클럽 로고 URL을 반환한다.
 */
export function getClubLogoUrl(url: string | null | undefined): string {
  if (!url) return DEFAULT_CLUB_LOGO;
  if (url.startsWith('http')) return url;
  return `${API_BASE_URL}${url}`;
}
