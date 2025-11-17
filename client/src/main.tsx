import React, {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import {BrowserRouter} from "react-router-dom";
import {Provider} from "react-redux";
import {store} from "./store.ts";
// import updateLocale from 'dayjs/plugin/updateLocale' // ES 2015
// import 'dayjs/locale/ru';
import dayjs from "dayjs";
import {Toaster} from "sonner";
import duration from 'dayjs/plugin/duration'
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import { TelegramProvider } from './hooks/useTelegram.tsx';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(duration)
dayjs.extend(localizedFormat);
// dayjs.extend(updateLocale)
//
// dayjs.locale('ru'); // Активируем русскую локаль

// Ручная настройка названий месяцев в родительном падеже
// dayjs.updateLocale('ru', {
//     months: [
//         'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
//         'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
//     ]
// });

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <BrowserRouter>
            <Provider store={store}>
                <TelegramProvider>
                    <App/>
                    <Toaster duration={1500} position="top-center"/>
                </TelegramProvider>
            </Provider>
        </BrowserRouter>
    </StrictMode>
)
