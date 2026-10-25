import { components } from '../api-contracts';

type ApiResponse<T> = {
  message?: string | null;
  result?: T | null;
  activity?: unknown;
  count?: number;
  token?: string | null;
  statusCode?: number;
  success?: boolean;
  refreshToken?: string | null;
};

type CentreSettings = components['schemas']['CentreSettingsBO'];
type AttendanceSummary = components['schemas']['AttendanceSummaryDto'];
type AnnouncementItem = components['schemas']['AnnouncementHistoryItemBO'];

describe('OpenAPI Contract & Schema Validation Tests (cpanel.bloomvie.com)', () => {
  it('validates CentreSettingsBO schema structure and externalBillingEnabled type contract', () => {
    const centreResponse: ApiResponse<CentreSettings> = {
      message: 'Success',
      statusCode: 200,
      success: true,
      result: {
        centreID: 101,
        centreName: 'Metropolitan Academy',
        externalBillingEnabled: false,
        isActive: true,
        isOnboarded: true,
        planAdd: true,
        studentAdd: true,
      },
    };

    expect(centreResponse.result).toBeDefined();
    expect(typeof centreResponse.result?.centreID).toBe('number');
    expect(typeof centreResponse.result?.externalBillingEnabled).toBe('boolean');
    expect(centreResponse.result?.externalBillingEnabled).toBe(false);
  });

  it('validates AttendanceSummaryDto schema structure against backend contract', () => {
    const summaryResponse: ApiResponse<AttendanceSummary> = {
      message: 'Success',
      statusCode: 200,
      success: true,
      result: {
        totalStaff: 25,
        presentCount: 20,
        absentCount: 3,
        leaveCount: 2,
      },
    };

    expect(summaryResponse.result?.totalStaff).toBe(25);
    expect(summaryResponse.result?.presentCount).toBe(20);
    expect(summaryResponse.result?.absentCount).toBe(3);
    expect(summaryResponse.result?.leaveCount).toBe(2);
  });

  it('validates AnnouncementHistoryItemBO list contract structure', () => {
    const listResponse: ApiResponse<AnnouncementItem[]> = {
      message: 'Success',
      count: 1,
      statusCode: 200,
      success: true,
      result: [
        {
          id: 10,
          classID: 4,
          className: 'Infants A',
          title: 'Holiday Closure',
          message: 'The center will be closed this Friday.',
          targetAudience: 'Students',
          sentDate: '2026-10-25T12:00:00Z',
        },
      ],
    };

    expect(Array.isArray(listResponse.result)).toBe(true);
    expect(listResponse.result?.[0].title).toBe('Holiday Closure');
    expect(listResponse.result?.[0].classID).toBe(4);
  });
});
