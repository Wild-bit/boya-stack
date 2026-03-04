import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export const formatToUTC8Time = (date: Date) => {
  return dayjs(date)
    .utc() // 先按 UTC 解析
    .tz('Asia/Shanghai') // 转为北京时间
    .format('YYYY-MM-DD HH:mm:ss');
};
