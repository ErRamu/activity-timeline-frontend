import React, { Suspense, useEffect, useRef, useState, useMemo } from "react";
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
// import SubNavBar from "../layouts/SubNavBar";
const SubNavBar = React.lazy(() => import("../layouts/SubNavBar"));

import { useEvent } from "../providers/EventProvider";
import { useFiscalYear } from "../providers/FiscalYearProvider";
import { useCategory } from "../providers/CategoryProvider";
import { useNavigate } from "react-router-dom";
import { BiCheck } from "react-icons/bi";
import LoadingPage from "../helpers/LoadingPage";
import NavBar from "../layouts/NavBar";
const API_URL = import.meta.env.VITE_API_URL;

function Index() {
  const { events } = useEvent();
  const { fiscalYears, fiscalYearLoading, activeYear } = useFiscalYear();
  const { categories } = useCategory();
  const navigate = useNavigate();

  const upcomingRef = useRef(null);
  const presentMonthRef = useRef(null);
  const selectedYearRef = useRef(null);
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("0");

  const filteredData = useMemo(() => {
    // const selected = parseInt(selectedYear);
    // const filteredByYear = selected
    //   ? events.filter((item) => item.fiscal_year_id === selected)
    //   : events;
    const filteredByCategory =
      selectedCategory !== "0"
        ? events.filter((item) =>
            item.categories.some((cat) => cat.id === parseInt(selectedCategory))
          )
        : events;
    // return filteredByCategory.filter((item) => item.status === selectedStatus);

    const filteredByStatus =
      selectedStatus === "all"
        ? filteredByCategory
        : filteredByCategory.filter((item) => item.status === selectedStatus);

    return filteredByStatus;
  }, [selectedYear, selectedStatus, selectedCategory, events]);

  const sortedEvents = useMemo(() => {
    const fiscalYearStartMonth = 3;

    return [...filteredData].sort((a, b) => {
      const dateA = new NepaliDate(a.date);
      const dateB = new NepaliDate(b.date);

      // Adjusting the dates to the fiscal year start month
      const adjustedMonthA =
        (dateA.getMonth() - fiscalYearStartMonth + 12) % 12;
      const adjustedMonthB =
        (dateB.getMonth() - fiscalYearStartMonth + 12) % 12;

      // Compare the adjusted months
      if (adjustedMonthA !== adjustedMonthB) {
        return adjustedMonthA - adjustedMonthB;
      }
      return dateA - dateB;
    });
  }, [filteredData]);

  // const todosByMonth = useMemo(() => {
  //   const todosByMonth = {};
  //   sortedEvents.forEach((todo) => {
  //     const month = new NepaliDate(todo.date).format("MMMM YYYY", "np");
  //     if (!todosByMonth[month]) {
  //       todosByMonth[month] = [];
  //     }
  //     todosByMonth[month].push(todo);
  //   });
  //   return todosByMonth;
  // }, [sortedEvents]);
  // const todosByFiscalYear = useMemo(() => {
  //   const todosByFiscalYear = {};

  //   sortedEvents.forEach((todo) => {
  //     const fiscalYearId = todo.fiscal_year_id; // Replace with the actual property name holding fiscal year ID
  //     const month = new NepaliDate(todo.date).format("MMMM", "np");

  //     // Initialize fiscal year object if not already present
  //     todosByFiscalYear[fiscalYearId] = todosByFiscalYear[fiscalYearId] || {};

  //     // Initialize month array if not already present
  //     todosByFiscalYear[fiscalYearId][month] =
  //       todosByFiscalYear[fiscalYearId][month] || [];

  //     // Push the event to the appropriate month array
  //     todosByFiscalYear[fiscalYearId][month].push(todo);
  //   });

  //   return todosByFiscalYear;
  // }, [sortedEvents]);

  const todosByFiscalYear = useMemo(() => {
    const todosByFiscalYear = {};

    sortedEvents.forEach((todo) => {
      const fiscalYear = todo.fiscal_year; // Assuming fiscal year object is directly attached to todo
      const month = new NepaliDate(todo.date).format("MMMM", "np");

      // Initialize fiscal year object if not already present
      todosByFiscalYear[fiscalYear.id] = todosByFiscalYear[fiscalYear.id] || {};

      // Initialize fiscal year properties if not already present
      if (!todosByFiscalYear[fiscalYear.id].fiscalYearYear && fiscalYear.year) {
        todosByFiscalYear[fiscalYear.id].fiscalYearYear = fiscalYear.year;
      }

      // Initialize month array if not already present
      todosByFiscalYear[fiscalYear.id].months =
        todosByFiscalYear[fiscalYear.id].months || {};

      // Initialize month array for this month if not already present
      todosByFiscalYear[fiscalYear.id].months[month] =
        todosByFiscalYear[fiscalYear.id].months[month] || [];

      // Push the event to the appropriate month array
      todosByFiscalYear[fiscalYear.id].months[month].push(todo);
    });

    return todosByFiscalYear;
  }, [sortedEvents]);

  // console.log(todosByFiscalYear);

  useEffect(() => {
    if (upcomingRef.current && sortedEvents.length > 0) {
      const now = new NepaliDate().valueOf();
      let nearestEvent = null;
      let minDiff = Infinity;

      for (let i = 0; i < sortedEvents.length; i++) {
        const event = sortedEvents[i];
        const eventDate = new NepaliDate(event.date).valueOf();
        const diff = eventDate - now;

        if (diff > 0 && diff < minDiff) {
          // Only consider future events
          minDiff = diff;
          nearestEvent = event;
        }

        // Break the loop if the current event is in the future
        if (diff > 0) {
          break;
        }
      }

      if (nearestEvent) {
        upcomingRef.current.scrollIntoView({
          block: "start",
          behavior: "smooth",
        });
      }
    }
  }, [fiscalYears]);

  const handleChangeYear = (e) => {
    setSelectedYear(e.target.value);
  };

  const handleStatusChange = (event) => {
    setSelectedStatus(event.target.value);
  };

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
  };

  const presentMonth = new NepaliDate().format("MMMM", "np");
  const isPresentMonth = (month) => {
    return month === presentMonth;
  };

  useEffect(() => {
    if (presentMonthRef.current) {
      presentMonthRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [sortedEvents]);

  useEffect(() => {
    if (selectedYearRef.current) {
      selectedYearRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedYear]);

  useEffect(() => {
    if (activeYear) {
      setSelectedYear(activeYear.id);
    }
  }, [activeYear]);

  if (fiscalYearLoading) {
    return <LoadingPage />;
  }

  return (
    <div className="relative max-w-full ">
      <div className="  bg-pink-50 ">
        {/* <div className=" mx-auto  ">
          <NavBar />
        </div> */}
      </div>
      <div className="   text-gray-700 bg-white shadow-lg   sticky top-0 z-[999]">
        <Suspense fallback={<div>Loading...</div>}>
          <div className="  ">
            <div className="lg:w-10/12  mx-auto">
              <SubNavBar
                handleCategoryChange={handleCategoryChange}
                handleStatusChange={handleStatusChange}
                selectedStatus={selectedStatus}
                selectedCategory={selectedCategory}
                selectedYear={selectedYear}
                handleChangeYear={handleChangeYear}
                fiscalYears={fiscalYears}
                setSelectedYear={setSelectedYear}
                categories={categories}
              />
            </div>
            <div className="text-center -mt-8">
              <span className="font-bold bg-white   p-2 text-blue-900 border border-red ">
                वार्षिक कार्ययोजना
              </span>
            </div>
          </div>
        </Suspense>
      </div>
      <div className="">
        {Object.entries(todosByFiscalYear)?.map(
          ([fiscalYearId, fiscalYearData], fiscalYearIndex) => (
            <div
              key={fiscalYearIndex}
              className="relative"
              ref={selectedYear === fiscalYearId ? selectedYearRef : null}
            >
              <h2 className="text-3xl font-bold mb-4 absolute top-5 right-10  z-[99]">
                {fiscalYearData.fiscalYearYear}
              </h2>
              {Object.entries(fiscalYearData.months)?.map(
                ([month, activities], index) => (
                  <div
                    className=""
                    ref={isPresentMonth(month) ? presentMonthRef : null}
                    style={{
                      backgroundColor: monthColors[index % monthColors.length],
                    }}
                    key={index}
                  >
                    <div>
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
                              borderTop: "5px solid #D22B2B",
                            }}
                            contentArrowStyle={{
                              borderRight: "7px solid  #fff",
                            }}
                            date={
                              new NepaliDate().format(
                                "ddd DD, MMMM YYYY",
                                "np"
                              ) ===
                              new NepaliDate(activity.date).format(
                                "ddd DD, MMMM YYYY",
                                "np"
                              )
                                ? "आज"
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
                            <div
                              onClick={() =>
                                navigate(
                                  `/dashboard/events/${activity.id}/view`
                                )
                              }
                            >
                              <div className="flex  gap-2">
                                {activity.categories?.map((cat, i) => (
                                  <span
                                    key={i}
                                    className="border py-1 px-2 shadow   rounded-full  text-xs"
                                  >
                                    {cat.name}
                                  </span>
                                ))}
                              </div>
                              <div>
                                <h3 className="font-bold text-xl mt-2">
                                  {activity.title}
                                </h3>
                                <small>
                                  {activity.content.slice(0, 100)}...
                                </small>
                              </div>

                              <div className="my-5">
                                <div className="font-bold text-gray-600 ">
                                  कार्यहरू :
                                </div>
                                <ul>
                                  {activity.tasks?.map(
                                    ({ documents, name }, i) => (
                                      <li
                                        className="flex p-2 border-b gap-2"
                                        key={i}
                                      >
                                        <div className="w-4 h-4  border rounded relative">
                                          {documents && (
                                            <div className="absolute -top-2 z-[9] -left-2">
                                              {" "}
                                              <BiCheck
                                                size={28}
                                                className="text-green-600"
                                              />
                                            </div>
                                          )}{" "}
                                        </div>
                                        <small>{name}</small>

                                        {documents && (
                                          <span className="flex gap-5">
                                            {/* <a
                                  href={`${API_URL}/storage/${documents}`}
                                  className="flex items-center gap-3 hover:text-blue-600 hover:underline"
                                  download="FileName.pdf"
                                >
                                  <BsEye
                                    size={23}
                                    className="text-gray-600"
                                  />
                                  <span className="italic ">view</span>
                                </a> */}
                                          </span>
                                        )}
                                      </li>
                                    )
                                  )}
                                </ul>
                              </div>
                              <div className="text-xs text-end mt-3 text-gray-500">
                                <strong>जिम्मेवार व्यक्ति / शाखा :</strong>
                                <span>{activity.assignTo}</span>
                              </div>

                              {/* <div>
                      <Share />
                    </div> */}
                            </div>
                          </VerticalTimelineElement>
                        ))}
                      </VerticalTimeline>
                    </div>
                  </div>
                )
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default Index;
