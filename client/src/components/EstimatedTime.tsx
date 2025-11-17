import {Clock} from "lucide-react";
import {FC, memo} from "react";


// Форматируем время в часы и минуты
export const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60

    if (hours === 0) {
        return `${remainingMinutes} minutes`
    } else if (remainingMinutes === 0) {
        return `${hours} hours`
    } else {
        return `${hours} hours and ${remainingMinutes} minutes`
    }
}

const EstimatedTime: FC<{ totalDuration: number }> = ({totalDuration}) => <div className="text-[13px] flex items-center justify-center gap-2 text-tg-theme-button-color text-base">
    <Clock className="w-5 h-5"/>
    <span>Cleaning time will take about {formatDuration(totalDuration)}</span>
</div>

export default memo(EstimatedTime);