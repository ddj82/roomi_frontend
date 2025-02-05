import React from 'react';
import Calendar from "react-calendar";
import dayjs from "dayjs";

const MyComponent = () => {
    return (
        <div>
            <div>
                <Calendar
                    minDate={new Date()}
                    formatDay={(locale, date) => dayjs(date).format('D')}
                />
            </div>
        </div>
    );
};

export default MyComponent;
