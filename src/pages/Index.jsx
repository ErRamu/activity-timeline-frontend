import React, { useEffect, useRef, useState, useMemo } from "react";
import {
  VerticalTimeline,
  VerticalTimelineElement,
} from "react-vertical-timeline-component";
import "react-vertical-timeline-component/style.min.css";
import StatusDots from "../components/StatusDots";
import { GiCheckMark } from "react-icons/gi";
import { activities } from "../json/activitiesNepali";
import { MdOutlineWorkHistory } from "react-icons/md";
import { monthColors } from "../json/monthsColors";
import Share from "../components/Share";
import NepaliDate from "nepali-date-converter";
import { status, statusNepali, categories } from "../json/company";
import SubNavBar from "../layouts/SubNavBar";
import { useEvent } from "../providers/EventProvider";
import { useFiscalYear } from "../providers/FiscalYearProvider";

function Index() {
  const upcomingRef = useRef(null);
  const [selectedYear, setSelectedYear] = useState(0);

  const { events } = useEvent();
  const { fiscalYears, fiscalYearLoading } = useFiscalYear();
  const [todos, setTodos] = useState([]);

  const filteredData = useMemo(() => {
    const selected = parseInt(selectedYear);
    return events.filter((item) => item.fiscal_year_id === selected);
  }, [selectedYear, events]);

  const sortedEvents = useMemo(() => {
    return filteredData.slice().sort((a, b) => {
      return new Date(a.date) - new Date(b.date);
    });
  }, [filteredData]);

  const todosByMonth = useMemo(() => {
    const todosByMonth = {};
    sortedEvents.forEach((todo) => {
      const month = new NepaliDate(todo.date).format("MMMM", "np");
      if (!todosByMonth[month]) {
        todosByMonth[month] = [];
      }
      todosByMonth[month].push(todo);
    });
    return todosByMonth;
  }, [sortedEvents]);

  console.log(todosByMonth);

  useEffect(() => {
    if (upcomingRef.current && sortedEvents.length > 0) {
      const now = new NepaliDate();
      const upcomingTodo = sortedEvents.find(
        (todo) => new NepaliDate(todo.date) > now
      );
      if (upcomingTodo) {
        upcomingRef.current.scrollIntoView({
          block: "start",
          behavior: "smooth",
        });
      }
    }
  }, [sortedEvents]);

  const handleChangeYear = (e) => {
    setSelectedYear(e.target.value);
  };

  // status

  const [selectedStatus, setSelectedStatus] = useState("notDone");

  const handleStatusChange = (event) => {
    setSelectedStatus(event.target.value);
  };

  // categories
  const [selectedCategory, setSelectedCategory] = useState("All");

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
  };

  if (fiscalYearLoading) {
    return "loading...";
  }

  return (
    <div className="relative max-w-screen">
      <div className="bg-white sticky top-0 z-[999]">
        <div>
          <SubNavBar
            handleCategoryChange={handleCategoryChange}
            handleStatusChange={handleStatusChange}
            selectedStatus={selectedStatus}
            selectedCategory={selectedCategory}
            selectedYear={selectedYear}
            handleChangeYear={handleChangeYear}
            fiscalYears={fiscalYears}
          />
        </div>
        <div className="text-center -mt-8">
          <span className="font-bold bg-white   p-2 text-blue-900 border border-red ">
            वार्षिक कार्य योजना
          </span>
        </div>
      </div>

      <div className="">
        {Object.entries(todosByMonth)?.map(([month, activities], index) => (
          <div
            className=""
            style={{
              backgroundColor: monthColors[index % monthColors.length],
            }}
            key={month}
          >
            <VerticalTimeline lineColor="#fff">
              <h1 className="text-3xl font-bold me-48 text-end underline">
                <div>{month}</div>
              </h1>
              {activities?.map((activity, i) => (
                <VerticalTimelineElement
                  key={i}
                  className={
                    new NepaliDate() < new NepaliDate(activity.date)
                      ? "brightness-50 p-0 m-0"
                      : ""
                  }
                  contentStyle={{
                    backgroundColor: "#fff",
                    borderTop: "5px solid #4B0082",
                  }}
                  contentArrowStyle={{ borderRight: "7px solid  #fff" }}
                  date={
                    new NepaliDate().format("ddd DD, MMMM YYYY", "np") ===
                    new NepaliDate(activity.date).format(
                      "ddd DD, MMMM YYYY",
                      "np"
                    )
                      ? "Today"
                      : new NepaliDate(activity.date).format(
                          "ddd DD, MMMM YYYY",
                          "np"
                        )
                  }
                  iconStyle={{
                    backgroundColor: {
                      canceled: "rgba(255,0,0)",
                      postponed: "#f5d327",
                      done: "rgb(0, 255, 0)",
                      notDone: "rgb(33, 150, 243)",
                    }[activity.status],
                    color: "#fff",
                  }}
                  icon={
                    activity.status === "done" ? (
                      <GiCheckMark />
                    ) : (
                      <MdOutlineWorkHistory />
                    )
                  }
                >
                  <div ref={upcomingRef}>
                    <div>
                      {activities.categories?.map(({ name }, i) => (
                        <span className="border p-1 bg-gray-100">{name}</span>
                      ))}
                    </div>

                    <div>
                      <h3 className="font-bold text-xl">{activity.title}</h3>
                      <small>{activity.content.slice(0, 100)}...</small>
                    </div>

                    <div className="my-5">
                      <div className="font-bold">कार्यहरू :</div>
                      <ul>
                        {activity.tasks?.map((task, i) => (
                          <li className="flex p-2 border-b-2" key={i}>
                            <small className="">{i + 1}. </small>
                            <small>{task}</small>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <Share />
                    </div>
                  </div>
                </VerticalTimelineElement>
              ))}
            </VerticalTimeline>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Index;
