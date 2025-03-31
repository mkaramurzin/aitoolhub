import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import "swiper/css";
import "swiper/css/mousewheel";
import "swiper/css/navigation";
import { Mousewheel } from "swiper/modules";
import { Swiper, SwiperRef, SwiperSlide } from "swiper/react";

export function Gallery({
  items,
  icon,
  title,
  options,
}: {
  items: JSX.Element[];
  icon: JSX.Element;
  title: string;
  options?: {
    width?: string;
  };
}) {
  const swiperRef = useRef<SwiperRef>();
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);
  const [key, setKey] = useState(0);

  const handlePrev = useCallback(() => {
    if (!swiperRef.current) return;
    // @ts-ignore
    swiperRef.current.slidePrev();
  }, []);

  const handleNext = useCallback(() => {
    if (!swiperRef.current) return;
    // @ts-ignore
    swiperRef.current.slideNext();
  }, []);

  const onSlideChange = useCallback((swiper: any) => {
    setIsBeginning(swiper.isBeginning);
    setIsEnd(swiper.isEnd);
  }, []);

  // Add an effect to update Swiper after the initial render or when items change
  useEffect(() => {
    setKey(key + 1);
  }, [items]);
  const isMobile = useIsMobile();

  return (
    <div className="flex w-full flex-row gap-4">
      <div className="flex w-full flex-col">
        <span className="mb-4 flex items-center gap-2 pl-6 text-xl">
          {icon}
          {title}
        </span>

        <div className="relative">
          <Swiper
            key={key}
            slidesOffsetBefore={24}
            onSwiper={(swiper: any) => {
              swiperRef.current = swiper;
              setIsBeginning(swiper.isBeginning);
              setIsEnd(swiper.isEnd);
            }}
            modules={[Mousewheel]}
            mousewheel={{ forceToAxis: true, thresholdDelta: 10 }}
            onSlideChange={onSlideChange}
            slidesPerView={"auto"}
            slidesPerGroupAuto={true}
            centeredSlides={false}
          >
            {items.map((item, index) => (
              <SwiperSlide
                key={index}
                style={{
                  backgroundColor: "transparent",
                  width: options?.width
                    ? options?.width
                    : isMobile
                      ? "300px"
                      : "350px",
                }}
              >
                <div className="flex h-full w-full pr-6">{item}</div>
              </SwiperSlide>
            ))}
          </Swiper>

          <div className="absolute left-0 top-0 z-10 hidden h-full items-center justify-between px-4 md:flex">
            <Button
              variant={"outline"}
              className="rounded-full p-2"
              onClick={handlePrev}
              disabled={isBeginning}
            >
              <ArrowLeft />
            </Button>
          </div>

          <div className="absolute right-0 top-0 z-10 hidden h-full items-center justify-between px-4 md:flex">
            <Button
              variant={"outline"}
              className="rounded-full p-2"
              onClick={handleNext}
              disabled={isEnd}
            >
              <ArrowRight />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
