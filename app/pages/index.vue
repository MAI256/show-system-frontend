<template>
    <main>
        <!-- Мобильное меню -->
        <ClientOnly>
            <TheMobileMenuButton @click="isMobileMenuOpen = true" />
            <TheMobileMenu
                :is-open="isMobileMenuOpen"
                @close="isMobileMenuOpen = false"
            />
        </ClientOnly>

        <section id="hero" class="hero">
            <div class="content">
                <div class="text">
                    <h1>
                        Комплексные решения<br />
                        для event-индустрии
                    </h1>
                    <h2>
                        Свет, звук, сцена и мультимедиа — полный цикл
                        технического продакшена под любые форматы событий
                    </h2>
                </div>

                <TheNavigation />
            </div>

            <!-- Portfolio Error Fallback -->
            <div v-if="portfolioError.hasError" class="portfolio-error">
                <ClientOnly>
                    <div class="portfolio-error-content">
                        <h3>{{ portfolioError.message }}</h3>
                        <button
                            v-if="portfolioError.canRetry"
                            @click="retryLoadProjects"
                            class="retry-button"
                        >
                            Попробовать снова
                        </button>
                    </div>
                </ClientOnly>
            </div>

            <!-- Normal portfolio (only if no error) -->
            <TheArcSlider
                v-else-if="portfolio.length > 0"
                :images="portfolioImages"
                :project-names="portfolioProjects"
                :project-slugs="portfolioSlugs"
                :auto-scroll="true"
                :auto-scroll-speed="3000"
                :arc-radius="1500"
                :arc-angle="180"
                :arc-depth="0.4"
                rect-width="13rem"
                rect-height="17rem"
                :show-outline="true"
                v-model="slideIndex"
                @ready="handleArcSliderReady"
                @showCardCopy="handleShowCardCopy"
                @hideCardCopy="handleHideCardCopy"
                @projectClick="handleProjectClick"
            />
        </section>

        <section id="steps" class="steps">
            <ClientOnly>
                <CardCopy :show="showCopy" :card-data="cardData" />
                <TheFractalBackground @raster-ready="handleFractalReady" />
            </ClientOnly>

            <div class="step">
                <div class="card">
                    <picture>
                        <!-- <source srcset="/steps/1.avif" type="image/avif" /> -->
                        <img
                            src="/steps/1.webp"
                            alt="Этап 1"
                            class="card-image"
                            loading="lazy"
                        />
                    </picture>
                    <div class="inner-shadow"></div>
                </div>
                <div class="text">
                    <TheTag>Этапы работы</TheTag>
                    <TheTextSplitter tag="h1"
                        >Как мы строим проекты: от идеи до
                        анализа</TheTextSplitter
                    >
                    <TheTextSplitter tag="p">
                        Чтобы ваша идея реализовалась без скрытых проблем и
                        превышения бюджета
                    </TheTextSplitter>
                </div>
                <TheTextSplitter tag="h2"></TheTextSplitter>
            </div>

            <picture class="fractal-separator" data-fractal="1">
                <source
                    :media="mediaQueryString"
                    srcset="/main-fractal-1-mob.webp"
                />
                <img src="/main-fractal-1.webp" alt="" />
            </picture>

            <div class="step">
                <div class="text">
                    <TheTag>Концепция</TheTag>
                    <TheTextSplitter tag="h1"
                        >ФОРМИРУЕМ КОНЦЕПЦИЮ И ВИЗУАЛЬНУЮ
                        ОСНОВУ</TheTextSplitter
                    >
                    <TheTextSplitter tag="p"
                        >Создаём сценарий будущего проекта, визуализации и
                        технические расчёты. Закладываем фундамент, чтобы идея
                        сразу работала в реальности</TheTextSplitter
                    >
                </div>
                <div class="card">
                    <picture>
                        <source srcset="/steps/2.avif" type="image/avif" />
                        <img
                            src="/steps/2.webp"
                            alt="Концепция"
                            class="card-image"
                            loading="lazy"
                        />
                    </picture>
                    <div class="inner-shadow"></div>
                </div>
                <TheTextSplitter tag="h2">1 Этап</TheTextSplitter>
            </div>

            <div class="step">
                <div class="card">
                    <picture>
                        <source srcset="/steps/3.avif" type="image/avif" />
                        <img
                            src="/steps/3.webp"
                            alt="Архитектура"
                            class="card-image"
                            loading="lazy"
                        />
                    </picture>
                    <div class="inner-shadow"></div>
                </div>
                <div class="text">
                    <TheTag>Архитектура</TheTag>
                    <TheTextSplitter tag="h1"
                        >СТРОИМ АРХИТЕКТУРУ ПРОЕКТА БЕЗ
                        ПРОБЕЛОВ</TheTextSplitter
                    >
                    <TheTextSplitter tag="p"
                        >Разрабатываем чертежи и схемы, подготавливаем монтажный
                        сценарий и полный пакет документов. Вы готовы к любым
                        согласованиям</TheTextSplitter
                    >
                </div>
                <TheTextSplitter tag="h2">2 Этап</TheTextSplitter>
            </div>

            <picture class="fractal-separator" data-fractal="2">
                <source
                    :media="mediaQueryString"
                    srcset="/main-fractal-2-mob.webp"
                />
                <img src="/main-fractal-2.webp" alt="" />
            </picture>

            <div class="step">
                <div class="text">
                    <TheTag>Реализация</TheTag>
                    <TheTextSplitter tag="h1"
                        >ЗАПУСКАЕМ РЕАЛИЗАЦИЮ БЕЗ ЛИШНИХ ПАУЗ И
                        ОШИБОК</TheTextSplitter
                    >
                    <TheTextSplitter tag="p"
                        >Организуем логистику, доставку и монтаж. Подключаем
                        сервисные центры контролируем процесс так, чтобы все
                        работало как часы</TheTextSplitter
                    >
                </div>
                <div class="card">
                    <picture>
                        <source srcset="/steps/4.avif" type="image/avif" />
                        <img
                            src="/steps/4.webp"
                            alt="Реализация"
                            class="card-image"
                            loading="lazy"
                        />
                    </picture>
                    <div class="inner-shadow"></div>
                </div>
                <TheTextSplitter tag="h2">3 Этап</TheTextSplitter>
            </div>

            <div class="step">
                <div class="card">
                    <picture>
                        <source srcset="/steps/5.avif" type="image/avif" />
                        <img
                            src="/steps/5.webp"
                            alt="Аналитика"
                            class="card-image"
                            loading="lazy"
                        />
                    </picture>
                    <div class="inner-shadow"></div>
                </div>
                <div class="text">
                    <TheTag>Аналитика</TheTag>
                    <TheTextSplitter tag="h1"
                        >АНАЛИЗИРУЕМ РЕЗУЛЬТАТ & ЗАКРЕПЛЯЕМ ОПЫТ НА
                        ПРАКТИКЕ</TheTextSplitter
                    >
                    <TheTextSplitter tag="p"
                        >После проекта делаем пост-анализ, измеряем
                        эффективность и фиксируем решения в архиве. Это база для
                        следующих совместных запусков</TheTextSplitter
                    >
                </div>
                <TheTextSplitter tag="h2">4 Этап</TheTextSplitter>
            </div>

            <picture class="fractal-separator" data-fractal="3">
                <source
                    :media="mediaQueryString"
                    srcset="/main-fractal-3-mob.webp"
                />
                <img src="/main-fractal-3.webp" alt="" />
            </picture>

            <div class="step step-portfolio">
                <div class="text">
                    <TheTag>Портфолио</TheTag>
                    <TheTextSplitter tag="h1"
                        >ИЗУЧИТЕ НАШИ РАБОТЫ И УБЕДИТЕСЬ В ЭФФЕКТИВНОСТИ
                        ПОДХОДА</TheTextSplitter
                    >
                    <TheTextSplitter tag="p"
                        >Свяжитесь с нами для доступа к портфолио и переднальной
                        демонстрации. Давайте превратим вашу идею в
                        предсказуемый успех!</TheTextSplitter
                    >
                    <div class="buttons">
                        <TheButton dark>Скачать презентацию</TheButton>
                        <TheButton @click="scrollToPortfolio"
                            >Перейти в портфолио</TheButton
                        >
                    </div>
                </div>
                <div class="card">
                    <img
                        src="/steps/6.webp"
                        alt="Портфолио"
                        class="card-image"
                        loading="lazy"
                    />
                    <div class="inner-shadow"></div>
                </div>
            </div>

            <TheNavigation dark />
        </section>
        <section id="services" class="services">
            <hr />

            <div class="header">Предоставляемые услуги</div>

            <div class="cards" @mousemove="handleMouseMove">
                <div class="card-container" data-card-index="0">
                    <div
                        class="card"
                        :class="{
                            'is-expanded': activeCardIndex === 0,
                            'is-faded':
                                activeCardIndex !== null &&
                                activeCardIndex !== 0,
                            'is-mobile-expanded': expandedMobileCards.has(0),
                        }"
                        @click="handleCardClick(0)"
                    >
                        <div class="card-inner">
                            <div class="card-front">
                                <div class="card-header">
                                    <h3>Ивент-продакшн под ключ</h3>
                                    <p>
                                        Полный цикл: от концепции и визуализации
                                        до монтажа и анализа
                                    </p>
                                </div>
                                <div class="card-expanded">
                                    <div class="expanded-column">
                                        <div class="expanded-section">
                                            <h4>Бриф и исследование</h4>
                                            <p>
                                                Сбор требований (цели,
                                                аудитория, KPI, бюджет,
                                                площадка, регламенты).
                                            </p>
                                            <p>
                                                Анализ референсов, аудитории и
                                                рисков.
                                            </p>
                                            <p>
                                                Формирование дорожной карты
                                                проекта.
                                            </p>
                                        </div>
                                        <div class="expanded-section">
                                            <h4>Концепция и сценарий</h4>
                                            <p>
                                                Разработка креативной идеи и
                                                сценарной структуры.
                                            </p>
                                            <p>
                                                Moodboard, стилевое решение,
                                                предварительные визуалы.
                                            </p>
                                            <p>
                                                Согласование концепции с
                                                заказчиком.
                                            </p>
                                        </div>
                                        <div class="expanded-section">
                                            <h4>Планирование и смета</h4>
                                            <p>
                                                Детализация задач по отделам
                                                (креатив, дизайн,
                                                лицензирование, логистика,
                                                техническая застройка).
                                            </p>
                                            <p>
                                                Составление сметы и графика
                                                работ.
                                            </p>
                                            <p>
                                                Подготовка контрактов и ТЗ
                                                подрядчикам.
                                            </p>
                                        </div>
                                        <div class="expanded-section">
                                            <h4>Производство и закупки</h4>
                                            <p>
                                                Заказ и комплектование
                                                оборудования, материалов,
                                                реквизита.
                                            </p>
                                            <p>
                                                Согласование чертежей и планов
                                                монтажа.
                                            </p>
                                        </div>
                                    </div>
                                    <div class="expanded-column">
                                        <div class="expanded-section">
                                            <h4>Монтаж и прогон</h4>
                                            <p>
                                                Физический монтаж, тесты,
                                                технические прогоны (soundcheck,
                                                lightcheck).
                                            </p>
                                            <p>
                                                Репетиции с артистами/ведущими.
                                            </p>
                                        </div>
                                        <div class="expanded-section">
                                            <h4>Реализация события</h4>
                                            <p>
                                                Управление событийным днём:
                                                координаторы, техдирекция,
                                                коммутация.
                                            </p>
                                            <p>Мониторинг.</p>
                                        </div>
                                        <div class="expanded-section">
                                            <h4>Демонтаж</h4>
                                            <p>
                                                Демонтаж, проверка состояния
                                                оборудования,
                                                возврат/складирование.
                                            </p>
                                        </div>
                                        <div
                                            class="expanded-section deliverables"
                                        >
                                            <h4>
                                                Ключевые артефакты
                                                (deliverables):
                                            </h4>
                                            <p>
                                                Бриф/план проекта, сметы,
                                                визуалы (PNG/PDF), 3D-макеты,
                                                монтажные чертежи, репорт по
                                                KPI.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="card-container" data-card-index="1">
                    <div
                        class="card"
                        :class="{
                            'is-expanded': activeCardIndex === 1,
                            'is-faded':
                                activeCardIndex !== null &&
                                activeCardIndex !== 1,
                            'is-mobile-expanded': expandedMobileCards.has(1),
                        }"
                        @click="handleCardClick(1)"
                    >
                        <div class="card-inner">
                            <div class="card-front">
                                <div class="card-header">
                                    <h3>3D визуализация и проектирование</h3>
                                    <p>
                                        Создаем точные цифровые двойники будущих
                                        проектов и мероприятий
                                    </p>
                                </div>
                                <div class="card-expanded">
                                    <div class="expanded-column">
                                        <div class="expanded-section">
                                            <h4>Сбор данных</h4>
                                            <p>
                                                Получение планов площадки,
                                                геометрии, фото, референсов.
                                            </p>
                                            <p>
                                                Лазерное сканирование /
                                                фотограмметрия (при
                                                необходимости).
                                            </p>
                                        </div>
                                        <div class="expanded-section">
                                            <h4>Подготовка ТЗ и LOD</h4>
                                            <p>
                                                Уточнение уровня детализации
                                                (LOD) для разных зон — от
                                                быстрых блоков до детальных
                                                моделей.
                                            </p>
                                            <p>
                                                Согласование форматов для
                                                интеграции (Unreal, Unity,
                                                Twinmotion, IFC).
                                            </p>
                                        </div>
                                        <div class="expanded-section">
                                            <h4>
                                                Моделирование и текстурирование
                                            </h4>
                                            <p>
                                                Создание архитектурной модели и
                                                сценографии.
                                            </p>
                                            <p>
                                                Материализация поверхностей,
                                                освещение, тени.
                                            </p>
                                        </div>
                                        <div class="expanded-section">
                                            <h4>Интеграция техники и сцен</h4>
                                            <p>
                                                Расстановка сценического
                                                оборудования, экранов,
                                                конструкций в модели.
                                            </p>
                                            <p>
                                                Проверка видимости, sightlines,
                                                safety-clearances.
                                            </p>
                                        </div>
                                    </div>
                                    <div class="expanded-column">
                                        <div class="expanded-section">
                                            <h4>Анимации и прогоны</h4>
                                            <p>
                                                Анимация света/видео/движущихся
                                                элементов.
                                            </p>
                                            <p>Рендеры, 360-визуализации.</p>
                                        </div>
                                        <div class="expanded-section">
                                            <h4>Экспорт и документация</h4>
                                            <p>
                                                Генерация рабочих чертежей,
                                                ведомостей материалов, монтажных
                                                указаний.
                                            </p>
                                            <p>
                                                Передача файлов подрядчикам в
                                                нужных форматах.
                                            </p>
                                        </div>
                                        <div class="expanded-section">
                                            <h4>Поддержка и правки</h4>
                                            <p>
                                                Быстрые итерации по замечаниям,
                                                финальные рендеры и
                                                мастер-файлы.
                                            </p>
                                        </div>
                                        <div class="expanded-section">
                                            <h4>Ключевые артефакты:</h4>
                                            <p>
                                                3D-модель (форматы), монтажные
                                                чертежи, ведомости материалов.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="card-container" data-card-index="2">
                    <div
                        class="card"
                        :class="{
                            'is-expanded': activeCardIndex === 2,
                            'is-faded':
                                activeCardIndex !== null &&
                                activeCardIndex !== 2,
                            'is-mobile-expanded': expandedMobileCards.has(2),
                        }"
                        @click="handleCardClick(2)"
                    >
                        <div class="card-inner">
                            <div class="card-front">
                                <div class="card-header">
                                    <h3>Техническое оснащение</h3>
                                    <p>
                                        Обеспечим ваше мероприятие всем
                                        необходимым оборудованием под ключ
                                    </p>
                                </div>
                                <div class="card-expanded">
                                    <div class="expanded-column">
                                        <div class="expanded-section">
                                            <h4>
                                                Составление технического райдера
                                            </h4>
                                            <p>
                                                Формирование списка
                                                оборудования: звук, свет, видео,
                                                LED-экраны, сценические
                                                конструкции, коммутация,
                                                электропитание.
                                            </p>
                                            <p>
                                                Учёт форматов: сцена, промозоны,
                                                прессволл, кофебрейк-зоны и т.п.
                                            </p>
                                        </div>
                                        <div class="expanded-section">
                                            <h4>Подбор оборудования</h4>
                                            <p>
                                                Оценка имеющихся у
                                                клиента/партнёров ресурсов или
                                                подбор аренды.
                                            </p>
                                            <p>
                                                Проверка совместимости систем
                                                (звук/видео/DMX/Dante/NDI).
                                            </p>
                                            <p>
                                                Расчёт мощности, покрытия,
                                                sightlines и акустических
                                                характеристик.
                                            </p>
                                        </div>
                                        <div class="expanded-section">
                                            <h4>Сметирование и договоры</h4>
                                            <p>
                                                Смета с ценами за позиции,
                                                доставкой, монтажом, демонтажом.
                                            </p>
                                            <p>
                                                Согласование контрактов с
                                                техническими поставщиками,
                                                страховкой (если нужна).
                                            </p>
                                        </div>
                                        <div class="expanded-section">
                                            <h4>Логистика и доставка</h4>
                                            <p>
                                                Расчёт необходимого
                                                автотранспорта (фуры, «газели»)
                                                и схем упаковки.
                                            </p>
                                            <p>
                                                Планирование времени
                                                загрузки/разгрузки и
                                                расположения техники на объекте.
                                            </p>
                                        </div>
                                    </div>
                                    <div class="expanded-column">
                                        <div class="expanded-section">
                                            <h4>Монтаж и настройка</h4>
                                            <p>
                                                Физическая установка: риг,
                                                экраны, световые фермы, звуковые
                                                системы.
                                            </p>
                                            <p>
                                                Настройка, калибровка,
                                                safety-check, прогон.
                                            </p>
                                        </div>
                                        <div class="expanded-section">
                                            <h4>
                                                Техподдержка и оператор на месте
                                            </h4>
                                            <p>
                                                Обеспечение дежурной бригады:
                                                инженеры, операторы
                                                света/звука/видео.
                                            </p>
                                            <p>
                                                Мониторинг в реальном времени,
                                                быстрое решение проблем.
                                            </p>
                                        </div>
                                        <div class="expanded-section">
                                            <h4>Демонтаж и возврат</h4>
                                            <p>
                                                Демонтаж, проверка сохранности,
                                                погрузка и возврат техники
                                                поставщикам/на склад.
                                            </p>
                                        </div>
                                        <div
                                            class="expanded-section deliverables"
                                        >
                                            <h4>Ключевые артефакты:</h4>
                                            <p>
                                                Техрайдер (PDF/Excel), смета с
                                                комплектацией, логистический
                                                план, акты приёма-передачи.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="card-container" data-card-index="3">
                    <div
                        class="card"
                        :class="{
                            'is-expanded': activeCardIndex === 3,
                            'is-faded':
                                activeCardIndex !== null &&
                                activeCardIndex !== 3,
                            'is-mobile-expanded': expandedMobileCards.has(3),
                        }"
                        @click="handleCardClick(3)"
                    >
                        <div class="card-inner">
                            <div class="card-front">
                                <div class="card-header">
                                    <h3>Технический продакшен</h3>
                                    <p>
                                        Организуем и контролируем все
                                        технические процессы на мероприятии
                                    </p>
                                </div>
                                <div class="card-expanded">
                                    <div class="expanded-column">
                                        <div class="expanded-section">
                                            <h4>
                                                Подготовка техническим
                                                директором (Technical Director)
                                            </h4>
                                            <p>
                                                Составление tech rider и run of
                                                show (ROS): распределение
                                                времени по задачам, монтажу,
                                                репетициям, старту шоу.
                                            </p>
                                            <p>
                                                Формирование технических команд
                                                (свет/звук/видео/rigging).
                                            </p>
                                        </div>
                                        <div class="expanded-section">
                                            <h4>Пре-продакшен встречи</h4>
                                            <p>
                                                Zoom/оффлайн встречи со всеми
                                                подразделениями, чтобы
                                                убедиться, что все процессы
                                                синхронизированы.
                                            </p>
                                            <p>
                                                Проверка коммутационных карт,
                                                power-distribution, каналов
                                                связи (рации, интерком).
                                            </p>
                                        </div>
                                        <div class="expanded-section">
                                            <h4>Монтаж (Load-in)</h4>
                                            <p>
                                                Приёмка площадки, разметка зон,
                                                монтаж конструкций.
                                            </p>
                                            <p>
                                                Управление процессом,
                                                синхронизация с подрядчиками,
                                                соблюдение Safety Rules.
                                            </p>
                                        </div>
                                    </div>
                                    <div class="expanded-column">
                                        <div class="expanded-section">
                                            <h4>Технические прогоны</h4>
                                            <p>
                                                Soundcheck, lightcheck,
                                                videocheck, комплексная
                                                репетиция (full rehearsal).
                                            </p>
                                        </div>
                                        <div class="expanded-section">
                                            <h4>Show-режим (Live)</h4>
                                            <p>
                                                Управление шоу в реальном
                                                времени: следование ROS,
                                                координация операторов, быстрое
                                                решение инцидентов.
                                            </p>
                                        </div>
                                        <div class="expanded-section">
                                            <h4>Постпродакшн</h4>
                                            <p>
                                                Демонтаж (Load-out), проверка
                                                состояния техники, составление
                                                отчёта (что прошло хорошо, что
                                                нужно улучшить).
                                            </p>
                                        </div>
                                        <div
                                            class="expanded-section deliverables"
                                        >
                                            <h4>Ключевые артефакты:</h4>
                                            <p>
                                                Technical Rider, ROS,
                                                коммутационные планы,
                                                постпродакшен-отчёт.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="card-container" data-card-index="4">
                    <div
                        class="card"
                        :class="{
                            'is-expanded': activeCardIndex === 4,
                            'is-faded':
                                activeCardIndex !== null &&
                                activeCardIndex !== 4,
                            'is-mobile-expanded': expandedMobileCards.has(4),
                        }"
                        @click="handleCardClick(4)"
                    >
                        <div class="card-inner">
                            <div class="card-front">
                                <div class="card-header">
                                    <h3>Разработка инсталляций</h3>
                                    <p>
                                        Создаем инженерно просчитанные и
                                        эффектные арт-объекты
                                    </p>
                                </div>
                                <div class="card-expanded">
                                    <div class="expanded-column">
                                        <div class="expanded-section">
                                            <h4>Идея и референсы</h4>
                                            <p>
                                                Формирование креативного
                                                запроса: интерактивность,
                                                медиа-арт, кинетика, статика,
                                                ночная/дневная визуализация.
                                            </p>
                                            <p>Сбор референсов, мудборды.</p>
                                        </div>
                                        <div class="expanded-section">
                                            <h4>Концепт-дизайн и скетчи</h4>
                                            <p>
                                                Эскизы, 3D-превью (блокаут),
                                                визуализация идеи.
                                            </p>
                                            <p>
                                                Согласование с
                                                клиентом/художественным
                                                директором.
                                            </p>
                                        </div>
                                        <div class="expanded-section">
                                            <h4>Техническая проработка</h4>
                                            <p>
                                                Конструктив: расчёт несущих
                                                элементов, вес, габариты.
                                            </p>
                                            <p>
                                                Интерактив: сенсоры, контроллеры
                                                (Arduino, Raspberry Pi, etc.),
                                                сценарии поведения.
                                            </p>
                                            <p>
                                                Медиа: видеопроекция, LED-ленты,
                                                PixelMapping, software
                                                (Resolume, TouchDesigner).
                                            </p>
                                        </div>
                                        <div class="expanded-section">
                                            <h4>Прототипирование</h4>
                                            <p>
                                                Создание макета/прототипа:
                                                проверка взаимодействия,
                                                прочности, внешнего вида.
                                            </p>
                                            <p>
                                                Тесты интеграции ПО и аппаратной
                                                части.
                                            </p>
                                        </div>
                                    </div>
                                    <div class="expanded-column">
                                        <div class="expanded-section">
                                            <h4>Производство</h4>
                                            <p>
                                                Изготовление конструкции,
                                                покраска, обшивка, монтаж
                                                электроники и контента.
                                            </p>
                                        </div>
                                        <div class="expanded-section">
                                            <h4>Тестирование и отладка</h4>
                                            <p>
                                                Полный прогон инсталляции:
                                                интерактив, стабильность,
                                                визуальный эффект.
                                            </p>
                                        </div>
                                        <div class="expanded-section">
                                            <h4>
                                                Логистика и монтаж на площадке
                                            </h4>
                                            <p>
                                                Доставка, сборка/установка,
                                                настройка света/контента,
                                                демонстрация клиенту.
                                            </p>
                                        </div>
                                        <div class="expanded-section">
                                            <h4>Поддержка и демонтаж</h4>
                                            <p>
                                                Техническая поддержка в период
                                                эксплуатации, затем разборка и
                                                хранение/утилизация.
                                            </p>
                                        </div>
                                        <div
                                            class="expanded-section deliverables"
                                        >
                                            <h4>Ключевые артефакты:</h4>
                                            <p>
                                                Концепт-арт (PNG/PDF),
                                                3D-модели, чертежи, видео
                                                тестов, инструкции по
                                                управлению.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="card-container" data-card-index="5">
                    <div
                        class="card"
                        :class="{
                            'is-expanded': activeCardIndex === 5,
                            'is-faded':
                                activeCardIndex !== null &&
                                activeCardIndex !== 5,
                            'is-mobile-expanded': expandedMobileCards.has(5),
                        }"
                        @click="handleCardClick(5)"
                    >
                        <div class="card-inner">
                            <div class="card-front">
                                <div class="card-header">
                                    <h3>Консалтинг мероприятий</h3>
                                    <p>
                                        Проанализируем вашу концепцию и поможем
                                        избежать ошибок
                                    </p>
                                </div>
                                <div class="card-expanded">
                                    <div class="expanded-column">
                                        <div class="expanded-section">
                                            <h4>Анализ запроса клиента</h4>
                                            <p>
                                                Изучение концепции, бюджета,
                                                площадки, аудитории и целей
                                                проекта.
                                            </p>
                                            <p>
                                                Выявление рисков и узких мест.
                                            </p>
                                        </div>
                                        <div class="expanded-section">
                                            <h4>
                                                Оценка технической реализуемости
                                            </h4>
                                            <p>
                                                Проверка, как заявленная идея
                                                соотносится с физическими
                                                условиями площадки
                                                (электричество, высота,
                                                грузоподъёмность, акустика).
                                            </p>
                                            <p>
                                                Рекомендации по оптимизации
                                                концепции (снизить сложность,
                                                ускорить монтаж, заменить
                                                оборудование).
                                            </p>
                                        </div>
                                        <div class="expanded-section">
                                            <h4>Составление плана действий</h4>
                                            <p>
                                                Roadmap/timeline: когда и что
                                                нужно заказать, закупить,
                                                смонтировать.
                                            </p>
                                            <p>
                                                Чек-лист критичных моментов
                                                (лицензии, страховки, safety).
                                            </p>
                                        </div>
                                        <div class="expanded-section">
                                            <h4>Аудит подрядчиков</h4>
                                            <p>
                                                Просмотр предложений
                                                подрядчиков: честная ли смета,
                                                правильно ли подобрано
                                                оборудование.
                                            </p>
                                            <p>
                                                Помощь в выборе самого
                                                подходящего исполнителя.
                                            </p>
                                        </div>
                                    </div>
                                    <div class="expanded-column">
                                        <div class="expanded-section">
                                            <h4>Пошаговые консультации</h4>
                                            <p>
                                                Регулярные zoom-созвоны,
                                                переписка: ответы на вопросы по
                                                ходу подготовки, корректировка
                                                планов.
                                            </p>
                                        </div>
                                        <div class="expanded-section">
                                            <h4>
                                                Финальная проверка (опционально)
                                            </h4>
                                            <p>
                                                Выездная инспекция на объект
                                                перед мероприятием: проверить,
                                                что всё смонтировано правильно.
                                            </p>
                                        </div>
                                        <div class="expanded-section">
                                            <h4>
                                                Постпродакшн-анализ
                                                (опционально)
                                            </h4>
                                            <p>
                                                Разбор полётов: что прошло
                                                хорошо, что можно улучшить для
                                                будущих мероприятий.
                                            </p>
                                        </div>
                                        <div
                                            class="expanded-section deliverables"
                                        >
                                            <h4>Ключевые артефакты:</h4>
                                            <p>
                                                Консультационные отчёты,
                                                чек-листы, roadmap, рекомендации
                                                по оптимизации.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </main>
</template>

<script lang="ts" setup>
import { useScrollAnimations } from "~/composables/useScrollAnimations";
import { useScrollTo } from "~/composables/useScrollTo";
import TheTextSplitter from "~/components/TheTextSplitter.vue";
import TheButton from "~/components/TheButton.vue";

// API composables
const { getProjects } = useDirectus();
const { getImageUrl: generateImageUrl, getSliderImageDimensions } =
    useDirectusImageUrl();

// Fetch projects from Directus
const { data: projectsData, error: projectsError } = await useAsyncData(
    "projects-portfolio",
    async () => {
        try {
            return await getProjects();
        } catch (err) {
            throw err;
        }
    },
);

// Handle portfolio errors - fallback UI for non-fatal errors
const portfolioError = computed(() => {
    if (projectsError.value) {
        const error = projectsError.value as any;
        return {
            hasError: true,
            message: error.message || "Не удалось загрузить проекты",
            canRetry: error.statusCode === 503,
            statusCode: error.statusCode,
        };
    }
    return { hasError: false };
});

// Retry function for portfolio loading
const retryLoadProjects = async () => {
    await refreshNuxtData("projects-portfolio");
};

// Transform fetched projects to portfolio format
const portfolio = computed(() => {
    if (!projectsData.value || !Array.isArray(projectsData.value)) {
        return [];
    }

    const { width, height } = getSliderImageDimensions();

    return projectsData.value.map((project: any) => ({
        id: project.id,
        slug: project.slug,
        src: generateImageUrl(
            project.main_photo?.id || project.main_photo,
            85,
            "cover",
            width,
            height,
        ),
        color: project.main_color || "#000000",
        project: project.title,
    }));
});

// Track fractal background loading
const fractalReady = ref(false);
const handleFractalReady = () => {
    fractalReady.value = true;
};

// Scroll to portfolio
const { scrollToSection } = useScrollTo();
const scrollToPortfolio = () => {
    scrollToSection("hero", { offset: "-15vh" });
};

// Debounce utility
const debounce = <T extends (...args: any[]) => any>(
    func: T,
    wait: number,
): ((...args: Parameters<T>) => void) => {
    let timeout: ReturnType<typeof setTimeout> | null = null;
    return (...args: Parameters<T>) => {
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
};

// SEO Meta tags
useHead({
    title: "ShowSystem — Комплексные решения для event-индустрии",
    meta: [
        {
            name: "description",
            content:
                "Свет, звук, сцена и мультимедиа — полный цикл технического продакшена под любые форматы событий. 3D визуализация, техническое оснащение и консалтинг.",
        },
        // Open Graph
        {
            property: "og:title",
            content: "ShowSystem — Комплексные решения для event-индустрии",
        },
        {
            property: "og:description",
            content:
                "Свет, звук, сцена и мультимедиа — полный цикл технического продакшена под любые форматы событий. 3D визуализация, техническое оснащение и консалтинг.",
        },
        {
            property: "og:type",
            content: "website",
        },
        {
            property: "og:url",
            content: "https://showsystem.productions",
        },
        {
            property: "og:image",
            content: "https://showsystem.productions/og-image.jpg",
        },
        {
            property: "og:image:width",
            content: "1200",
        },
        {
            property: "og:image:height",
            content: "630",
        },
        // Twitter Card
        {
            name: "twitter:card",
            content: "summary_large_image",
        },
        {
            name: "twitter:title",
            content: "ShowSystem — Комплексные решения для event-индустрии",
        },
        {
            name: "twitter:description",
            content:
                "Свет, звук, сцена и мультимедиа — полный цикл технического продакшена под любые форматы событий.",
        },
        {
            name: "twitter:image",
            content: "https://showsystem.productions/og-image.jpg",
        },
        // Additional SEO
        {
            name: "keywords",
            content:
                "event, event-индустрия, техническое оснащение, свет, звук, сцена, мультимедиа, 3D визуализация, продакшн, мероприятия",
        },
        {
            name: "robots",
            content: "index, follow",
        },
    ],
    link: [
        {
            rel: "canonical",
            href: "https://showsystem.productions",
        },
    ],
});

const slideIndex = ref<number>(0);

// Memoized computed values
const portfolioImages = computed(() => portfolio.value.map((e) => e.src));
const portfolioProjects = computed(() => portfolio.value.map((e) => e.project));
const portfolioSlugs = computed(() => portfolio.value.map((e) => e.slug));

// Используем composable для управления состоянием копии карточки (только на клиенте)
const showCopy = ref(false);
const cardData = ref({
    imageIndex: 0,
    imageSrc: "",
    rectWidth: "13rem",
    rectHeight: "17rem",
});

const handleShowCardCopy = (data: typeof cardData.value) => {
    cardData.value = data;
    showCopy.value = true;
};

const handleHideCardCopy = () => {
    showCopy.value = false;
};

const handleProjectClick = (slug: string) => {
    navigateTo(`/case/${slug}`);
};

// Store last mouse position and animation frame ID
let lastMouseX = 0;
let lastMouseY = 0;
let isHovering = false;
let animationFrameId: number | null = null;

// Fractal positioning function (declare early so we can reference it in cleanup)
let debouncedPositionFractals: ReturnType<typeof debounce> | null = null;

// Mobile detection synced with CSS variables
const isMobile = ref(false);

// Mobile menu state
const isMobileMenuOpen = ref(false);

// Active card state for expansion animation
const activeCardIndex = ref<number | null>(null);

// Mobile card expansion state
const expandedMobileCards = ref<Set<number>>(new Set());

// Функция для пересчёта размеров и offset'ов активной карточки (optimized)
const updateExpandedCardDimensions = () => {
    if (activeCardIndex.value === null || typeof document === "undefined")
        return;

    const cardsContainer = document.querySelector(
        ".services .cards",
    ) as HTMLElement;
    if (!cardsContainer) return;

    const clickedCardContainer = document.querySelectorAll(".card-container")[
        activeCardIndex.value
    ] as HTMLElement;
    if (!clickedCardContainer) return;

    const card = clickedCardContainer.querySelector(".card") as HTMLElement;
    if (!card) return;

    // Use RAF for smooth updates
    requestAnimationFrame(() => {
        const width = cardsContainer.offsetWidth;
        const height = cardsContainer.offsetHeight;

        const cardsRect = cardsContainer.getBoundingClientRect();
        const cardRect = clickedCardContainer.getBoundingClientRect();

        const offsetX = cardRect.left - cardsRect.left;
        const offsetY = cardRect.top - cardsRect.top;

        card.style.setProperty("--expanded-width", `${width}px`);
        card.style.setProperty("--expanded-height", `${height}px`);
        card.style.setProperty("--offset-x", `${-offsetX}px`);
        card.style.setProperty("--offset-y", `${-offsetY}px`);
    });
};

// Debounced version for resize events
const debouncedUpdateExpandedCardDimensions = debounce(
    updateExpandedCardDimensions,
    150,
);

// Handle card click for both desktop and mobile
const handleCardClick = (index: number) => {
    if (isMobile.value) {
        // Mobile: toggle card in expandedMobileCards set
        if (expandedMobileCards.value.has(index)) {
            expandedMobileCards.value.delete(index);
        } else {
            expandedMobileCards.value.add(index);
        }
        // Trigger reactivity
        expandedMobileCards.value = new Set(expandedMobileCards.value);
    } else {
        // Desktop: use activeCardIndex
        if (activeCardIndex.value === index) {
            // Close if clicking the same card
            activeCardIndex.value = null;
        } else {
            // Open the clicked card
            activeCardIndex.value = index;

            // Вычисляем размеры .cards и offset карточки
            nextTick(() => {
                updateExpandedCardDimensions();
            });
        }
    }
};

// Get mobile breakpoint from CSS variables (memoized)
const mobileBreakpoint = ref(1200);

// Media query string for picture elements
const mediaQueryString = computed(
    () => `(max-width: ${mobileBreakpoint.value}px)`,
);

// Check if device is mobile
const checkMobile = () => {
    if (typeof window === "undefined") return;
    isMobile.value = window.innerWidth <= mobileBreakpoint.value;
};

// Debounced version of checkMobile
const debouncedCheckMobile = debounce(checkMobile, 150);

// Setup mobile detection with resize listener
const setupMobileDetection = () => {
    if (typeof window === "undefined") return () => {};
    checkMobile();
    window.addEventListener("resize", debouncedCheckMobile, { passive: true });
    return () => window.removeEventListener("resize", debouncedCheckMobile);
};

// Update card coordinates for hover effect (optimized)
const updateCardCoordinates = (
    card: HTMLElement,
    mouseX: number,
    mouseY: number,
) => {
    const rect = card.getBoundingClientRect();
    const x = mouseX - rect.left;
    const y = mouseY - rect.top;

    card.style.setProperty("--mouse-x", `${x}px`);
    card.style.setProperty("--mouse-y", `${y}px`);
};

// Continuous update loop during hover (optimized with caching)
let cachedCards: HTMLElement[] | null = null;
const updateLoop = () => {
    if (!isHovering) return;

    if (!cachedCards) {
        cachedCards = Array.from(document.querySelectorAll(".services .card"));
    }

    for (const card of cachedCards) {
        updateCardCoordinates(card, lastMouseX, lastMouseY);
    }

    animationFrameId = requestAnimationFrame(updateLoop);
};

// Magical hover effect handlers (optimized)
const handleMouseMove = (e: MouseEvent) => {
    if (isMobile.value) return;
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
};

const handleMouseEnter = () => {
    if (isMobile.value) return;
    isHovering = true;
    cachedCards = Array.from(document.querySelectorAll(".services .card"));
    if (animationFrameId === null) {
        updateLoop();
    }
};

const handleMouseLeave = () => {
    if (isMobile.value) return;
    isHovering = false;
    if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
};

// Note: Card flip animation removed in favor of expansion animation

// Current slide color (computed)
const currentSlideColor = computed(
    () => portfolio.value[slideIndex.value]?.color || "#E42C3C",
);

// Watch for slide index changes to update CSS variable (optimized)
watch(
    currentSlideColor,
    (newColor) => {
        if (typeof document !== "undefined") {
            requestAnimationFrame(() => {
                document.documentElement.style.setProperty(
                    "--slide-color",
                    newColor,
                );
            });
        }
    },
    { immediate: true },
);

// Watch showCopy to clear element cache when CardCopy is recreated
watch(showCopy, (newShow) => {
    if (newShow) {
        // CardCopy появляется - очищаем кеш чтобы scrollAnimations нашел новый элемент
        nextTick(() => {
            scrollAnimations.clearElementCache(
                ".card-copy:not(.card-copy-left):not(.card-copy-right)",
            );
        });
    }
});

// Arc slider ready promise
let arcSliderReadyResolve: (() => void) | null = null;
const arcSliderReady = new Promise<void>((resolve) => {
    arcSliderReadyResolve = resolve;
});

const handleArcSliderReady = () => {
    if (arcSliderReadyResolve) {
        arcSliderReadyResolve();
    }
};

// Function references for cleanup
let animateStepsFunc: (() => void) | null = null;

// Setup event listeners
onMounted(async () => {
    // Only run on client
    if (!import.meta.client) return;

    // Setup mobile detection
    const cleanupMobileDetection = setupMobileDetection();

    // Register cleanup callbacks before any awaits
    onUnmounted(() => {
        cleanupMobileDetection();
        window.removeEventListener(
            "resize",
            debouncedUpdateExpandedCardDimensions,
        );
        if (debouncedPositionFractals) {
            window.removeEventListener("resize", debouncedPositionFractals);
        }
        if (animateStepsFunc) {
            window.removeEventListener("scroll", animateStepsFunc);
        }
        if (animationFrameId !== null) {
            cancelAnimationFrame(animationFrameId);
        }
    });

    // Get mobile breakpoint from CSS variable
    let mobileBreakpoint = 1200;
    const computedStyle = getComputedStyle(document.documentElement);
    const mobileVar = computedStyle.getPropertyValue("--mobile");
    if (mobileVar) {
        mobileBreakpoint = parseInt(mobileVar, 10);
    }

    // Wait for arc slider to be fully ready
    await Promise.race([
        arcSliderReady,
        new Promise((resolve) => setTimeout(resolve, 500)), // Fallback timeout
    ]);

    const cardsContainer = document.querySelector(".services .cards");
    if (cardsContainer) {
        cardsContainer.addEventListener("mouseenter", handleMouseEnter);
        cardsContainer.addEventListener("mouseleave", handleMouseLeave);
    }

    // Watch for mobile state changes to clear expanded cards
    watch(isMobile, (newIsMobile) => {
        if (!newIsMobile) {
            expandedMobileCards.value.clear();
        }
    });

    // Обработчик resize для пересчёта размеров активной карточки (debounced)
    window.addEventListener("resize", debouncedUpdateExpandedCardDimensions, {
        passive: true,
    });

    // Position fractal separators between steps
    const positionFractals = () => {
        const stepsContainer = document.querySelector(".steps") as HTMLElement;
        if (!stepsContainer) return;

        const stepElements = Array.from(
            stepsContainer.querySelectorAll(".step"),
        ) as HTMLElement[];
        const fractals = Array.from(
            stepsContainer.querySelectorAll(".fractal-separator"),
        ) as HTMLElement[];

        // fractal 1 goes between step 0 and step 1
        // fractal 2 goes between step 2 and step 3
        // fractal 3 goes between step 4 and step-portfolio (step 5)
        const fractalPairs = [
            { fractal: 0, stepBefore: 0, stepAfter: 1 },
            { fractal: 1, stepBefore: 2, stepAfter: 3 },
            { fractal: 2, stepBefore: 4, stepAfter: 5 },
        ];

        fractalPairs.forEach(({ fractal, stepBefore, stepAfter }) => {
            const fractalEl = fractals[fractal];
            const stepBeforeEl = stepElements[stepBefore];
            const stepAfterEl = stepElements[stepAfter];

            if (!fractalEl || !stepBeforeEl || !stepAfterEl) return;

            const stepsRect = stepsContainer.getBoundingClientRect();
            const stepBeforeRect = stepBeforeEl.getBoundingClientRect();
            const stepAfterRect = stepAfterEl.getBoundingClientRect();

            // Calculate center position between two steps
            const centerY = (stepBeforeRect.bottom + stepAfterRect.top) / 2;
            const fractalTop = centerY - stepsRect.top;

            fractalEl.style.top = `${fractalTop}px`;
        });
    };

    // Setup scroll animation for step cards
    let steps: HTMLElement[] = [];
    let stepAnimationState = new Map<HTMLElement, boolean>();

    const setupStepAnimation = () => {
        steps = Array.from(
            document.querySelectorAll(".steps .step"),
        ) as HTMLElement[];
        steps.forEach((step) => {
            stepAnimationState.set(step, false);
        });
    };

    animateStepsFunc = () => {
        steps.forEach((step) => {
            const rect = step.getBoundingClientRect();

            // Smooth animation using viewport position
            // Target: fade in when element is at 75% viewport, peak at 50%, fade out at 25%
            const stepCenter = rect.top + rect.height / 2;
            const vh = window.innerHeight;

            // Normalize position: 0 = bottom of viewport, 1 = top of viewport
            const normalizedPos = (vh - stepCenter) / vh;

            // Create smooth bell curve: peaks at 0.5 (center), fades at edges
            // Using cosine for smooth easing
            const progress = Math.max(
                0,
                Math.cos((normalizedPos - 0.5) * Math.PI) * 0.5 + 0.5,
            );
            const clampedProgress = Math.max(0, Math.min(1, progress));

            // Skip if completely out of view
            const isInViewport =
                rect.top <= window.innerHeight && rect.bottom >= 0;
            if (!isInViewport) return;

            // Scale from 0.8 to 1
            const scale = 0.8 + clampedProgress * 0.2;
            const opacity = clampedProgress;

            step.style.transform = `scale(${scale})`;
            step.style.opacity = String(opacity);

            const isAnimated = stepAnimationState.get(step) || false;

            // Trigger text split animation when element is well-visible
            if (clampedProgress >= 0.85 && !isAnimated) {
                stepAnimationState.set(step, true);
                step.dispatchEvent(
                    new CustomEvent("text-split-trigger", {
                        bubbles: true,
                    }),
                );
            }

            // Reverse animation when element fades out significantly
            if (clampedProgress < 0.15 && isAnimated) {
                stepAnimationState.set(step, false);
                step.dispatchEvent(
                    new CustomEvent("text-split-reverse", {
                        bubbles: true,
                    }),
                );
            }

            // Reset animation state completely when opacity is 0 for reusability
            if (opacity <= 0.01 && isAnimated) {
                stepAnimationState.set(step, false);
            }
        });
    };

    setupStepAnimation();
    positionFractals();

    debouncedPositionFractals = debounce(positionFractals, 150);
    if (debouncedPositionFractals) {
        window.addEventListener("resize", debouncedPositionFractals, {
            passive: true,
        });
    }
    window.addEventListener("scroll", animateStepsFunc, { passive: true });
});

// ====== SCROLL ANIMATIONS SETUP ======
const scrollAnimations = useScrollAnimations({
    container: "main",
    animations: [
        // {
        //     selector: ".steps .content",
        //     property: "style.opacity",
        //     from: 0,
        //     to: 1,
        //     start: 0,
        //     end: "30vh",
        //     easing: (t: number) => t,
        // },
        // === CARD-COPY WIDTH & OPACITY ===
        {
            selector: ".card-copy:not(.card-copy-left):not(.card-copy-right)",
            property: "data-animation",
            from: 0,
            to: 0,
            start: "0vh",
            end: "55vh",
            customHandler: (el: HTMLElement) => {
                if (
                    el.classList.contains("card-copy-left") ||
                    el.classList.contains("card-copy-right")
                )
                    return;
                const vh = scrollAnimations.scrollVh.value;
                const isMobileDevice = isMobile.value;
                let width = isMobileDevice ? 40 : 13.8;
                let opacity = 1;

                if (isMobileDevice) {
                    // Mobile: width 40 → 50 (0-50vh), fade-out (50-65vh)
                    if (vh < 80) {
                        const p = vh / 80;
                        width = 40 + (50 - 40) * p; // 40vw → 50vw
                        opacity = 1;
                    } else if (vh < 95) {
                        width = 50;
                        opacity = 1 - (vh - 80) / 15;
                    } else {
                        width = 50;
                        opacity = 0;
                    }
                } else {
                    // Desktop: width 13.8 → 20 (0-100vh), fade-out (100-115vh)
                    if (vh < 100) {
                        const p = vh / 100;
                        width = 13.8 + (18 - 13.8) * p; // 13.8vw → 20vw
                        opacity = 1;
                    } else if (vh < 115) {
                        width = 18;
                        opacity = 1 - (vh - 100) / 15;
                    } else {
                        width = 18;
                        opacity = 0;
                    }
                }

                el.style.width = `${width}vw`;
                el.style.opacity = String(Math.max(0, Math.min(1, opacity)));
            },
        },
    ],
});
</script>

<style lang="postcss" scoped>
@import url(~/assets/css/_variables.css);

section {
    min-height: 100vh;
}

.fractal-background {
    min-width: 100dvw;
    max-width: 100dvw;
    height: auto;

    position: absolute;
    left: 0;

    z-index: -10;
}

.hero {
    .content {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2rem;

        z-index: 10;

        .text {
            width: 50vw;
            position: relative;
            min-height: 8rem;

            display: flex;
            flex-direction: column;
            text-align: center;
            gap: 0.5rem;

            @media screen and (max-width: $mobile) {
                width: 90vw;
            }

            h1 {
                @mixin display-bold-large;
                text-transform: uppercase;

                @media screen and (max-width: $mobile) {
                    @mixin display-bold-average;
                }
            }

            h2 {
                @mixin text-light-large;
                color: #ffffff48;

                @media screen and (max-width: $mobile) {
                    @mixin text-light-average;
                }
            }
        }
    }
}

.hero {
    height: 115dvh;
    position: relative;
    display: flex;
    width: 92rem;
    padding: 9.5rem 4rem 2rem 4rem;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    gap: 4rem;

    z-index: 2;

    @media screen and (max-width: $mobile) {
        padding: unset;
        height: 100dvh;
        width: unset;
        padding-top: 15vh;
    }

    .arc-slider-wrapper {
        width: 100vw;
        height: 80vh;

        top: 35vh;
        left: 0;

        @media screen and (max-width: $mobile) {
            top: unset;
        }

        z-index: 5;
    }
}

.steps {
    position: relative;
    padding-top: 75vh;

    display: flex;
    flex-direction: column;
    gap: 15vh;

    z-index: 1;

    @media screen and (max-width: $mobile) {
        padding-left: 6.25vw;
        padding-right: 6.25vw;
    }

    .fractal-background {
        top: calc(-115dvh - 7rem);
    }

    .fractal-separator {
        position: absolute;
        width: 100vw;
        left: 50%;
        transform: translateX(-50%) translateY(-50%);
        height: auto;
        z-index: -1;
        pointer-events: none;

        img {
            width: 100%;
            height: auto;
            display: block;
        }
    }

    .step {
        width: 100%;
        padding: 0 4.5vw;

        display: flex;
        gap: 9vw;
        align-items: center;

        position: relative;

        will-change: transform, opacity;

        @media screen and (max-width: $mobile) {
            display: grid;
            grid-template-columns: 1fr 1fr;
            row-gap: 1.5rem;
            column-gap: 1.3125rem;
            align-items: start;

            .card {
                grid-column: 1;
                grid-row: 1;
                align-self: center;
            }

            > :deep(h2) {
                grid-column: 2;
                grid-row: 1;
                align-self: center;
            }

            .text {
                grid-column: 1 / -1;
                grid-row: 2;
                justify-self: end;
                flex: unset;
            }

            /* Alternate order for every other step */
            &:nth-child(even) {
                .card {
                    grid-column: 2;
                }

                > :deep(h2) {
                    grid-column: 1;
                }
            }
        }

        /* Typography styles for step content */
        .text {
            display: flex;
            flex-direction: column;
            gap: 1rem;
            flex: 7;
            max-width: 72vw;

            .tag {
                margin-bottom: 1rem;

                @media screen and (max-width: $mobile) {
                    font-size: 1rem;
                }
            }
        }

        .text :deep(h1) {
            @mixin display-bold-large;
            text-transform: uppercase;
            color: $text-color-primary;

            @media screen and (max-width: $mobile) {
                font-size: 1.5rem;
            }
        }

        .text :deep(p) {
            @mixin text-light-average;
            color: color-mix(in srgb, $text-color-primary 50%, transparent);

            @media screen and (max-width: $mobile) {
                font-size: 1.25rem;
            }
        }

        > :deep(h2) {
            @mixin display-bold-large;
            text-transform: uppercase;
            color: $text-color-primary;
            flex: 3;

            @media screen and (max-width: $mobile) {
                font-size: 1.4rem;
            }
        }

        .card {
            width: 22vw;
            aspect-ratio: 9 / 16;
            position: relative;
            border-radius: 1.25rem;
            overflow: hidden;
            box-shadow:
                0 4px 20px rgba(0, 0, 0, 0.15),
                0 1px 3px rgba(0, 0, 0, 0.1);

            min-width: 0;

            @media screen and (max-width: $mobile) {
                width: 57vw;
            }
        }

        .card-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
        }

        .inner-shadow {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: radial-gradient(
                circle at center,
                transparent 0%,
                transparent 70%,
                rgba(0, 0, 0, 0.2) 100%
            );
            pointer-events: none;
        }
    }

    .step-portfolio {
        margin-bottom: 18vh;
        justify-content: space-between;

        .text {
            max-width: unset;

            .tag {
                margin-bottom: 2rem;
            }

            .buttons {
                display: flex;
                gap: 0.5rem;
                margin-top: 2rem;
            }
        }

        .card {
            aspect-ratio: 5 / 4;
            flex: 7;
            transform: rotateY(-20deg);
            perspective: 1000px;
        }

        @media screen and (max-width: $mobile) {
            margin-bottom: 9vh;
            display: flex;
            flex-direction: column;
            gap: 2.2125rem;

            .text {
                order: 2;
                width: 100%;

                .tag {
                    margin-bottom: 2rem;
                }

                .buttons {
                    display: flex;
                    gap: 0.5rem;
                    margin-top: 2rem;
                }
            }

            .card {
                width: 100%;

                aspect-ratio: 4 / 3.3;
                order: 1;
                transform: none;
                flex: unset;
            }

            > :deep(h2) {
                display: none;
            }
        }
    }

    .navigation {
        position: absolute;
        bottom: 1rem;
        left: 50%;
        transform: translateX(-50%);

        z-index: 10;

        @media screen and (max-width: $mobile) {
            bottom: 2rem;
        }
    }
}

.services {
    position: relative;
    padding: 2rem 4rem 4rem 4rem;

    @media screen and (max-width: $mobile) {
        padding: 2rem;
    }

    display: flex;
    flex-direction: column;
    gap: 3rem;

    z-index: 5;

    hr {
        background: #161616 !important;
    }

    .header {
        width: 100%;
        padding: 2rem;
        margin-top: 1rem;

        @mixin text-light-medium;
        color: rgba(255, 255, 255, 0.48);

        border-radius: 2rem 0 0 0;
        border-top: 1px solid #161616;
        border-left: 1px solid #161616;
        background: transparent;
    }

    .cards {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 0.5rem;

        @media screen and (max-width: $mobile) {
            grid-template-columns: 1fr;
            gap: 1rem;
        }

        @media screen and (min-width: calc($mobile + 1px)) {
            &:hover > .card .card-inner::after {
                opacity: 1;
            }
        }

        .card-container {
            width: 100%;
            height: 18rem;
            position: relative;

            @media screen and (max-width: $mobile) {
                height: auto;
                min-height: 18rem;
            }
        }

        .card {
            width: 100%;
            height: 100%;
            position: absolute;
            top: 0;
            left: 0;

            cursor: pointer;
            user-select: none;

            transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);

            @media screen and (max-width: $mobile) {
                position: relative;
                height: auto;
                min-height: 18rem;
            }

            @media screen and (min-width: calc($mobile + 1px)) {
                &.is-expanded {
                    width: var(--expanded-width, 100%);
                    height: var(--expanded-height, 100%);
                    transform: translate(
                        var(--offset-x, 0),
                        var(--offset-y, 0)
                    );
                    z-index: 1000;
                }

                &.is-faded {
                    transform: scale(0);
                    opacity: 0;
                    pointer-events: none;
                }

                &:hover .card-inner::before {
                    opacity: 1;
                }
            }

            .card-inner {
                position: relative;
                width: 100%;
                height: 100%;
                transition: transform 0.75s;

                @media screen and (max-width: $mobile) {
                    height: auto;
                    min-height: 18rem;
                }

                &::before,
                &::after {
                    border-radius: 2.5rem;
                    content: "";
                    height: 100%;
                    left: 0px;
                    opacity: 0;
                    position: absolute;
                    top: 0px;
                    transition: opacity 500ms;
                    width: 100%;
                    pointer-events: none;
                }

                &::before {
                    background: radial-gradient(
                        800px circle at var(--mouse-x) var(--mouse-y),
                        rgba(255, 255, 255, 0.06),
                        transparent 40%
                    );
                    z-index: 3;
                }

                &::after {
                    background: radial-gradient(
                        600px circle at var(--mouse-x) var(--mouse-y),
                        rgba(255, 255, 255, 0.3),
                        transparent 40%
                    );
                    z-index: 1;
                }

                .card-front {
                    position: relative;
                    width: 100%;
                    height: 100%;

                    padding: 2rem;

                    display: flex;
                    flex-direction: column;
                    gap: 2rem;

                    border-radius: 2.5rem;
                    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08);
                    background: rgba(255, 255, 255, 0.04);
                    backdrop-filter: blur(4px);

                    @media screen and (max-width: $mobile) {
                        height: auto;
                        min-height: 18rem;
                    }

                    /* Стили для прямых потомков (старая структура) */
                    > h3 {
                        @mixin display-bold-small;
                        color: #f2f2f5;
                        text-transform: uppercase;
                        margin-bottom: 1rem;
                    }

                    > p {
                        @mixin text-light-medium;
                        color: rgba(255, 255, 255, 0.48);
                        margin-top: auto;
                    }

                    /* Стили для новой структуры с .card-header */
                    .card-header {
                        h3 {
                            @mixin display-bold-small;
                            color: #f2f2f5;
                            text-transform: uppercase;
                            margin-bottom: 1rem;
                        }

                        p {
                            @mixin text-light-medium;
                            color: rgba(255, 255, 255, 0.48);
                        }
                    }

                    .card-expanded {
                        display: flex;
                        gap: 2rem;

                        max-height: 0;
                        overflow: hidden;
                        opacity: 0;
                        transition:
                            max-height 0.5s ease,
                            opacity 0.4s ease 0.1s;

                        @media screen and (max-width: $mobile) {
                            flex-direction: column;
                            gap: 1.5rem;
                        }

                        .expanded-column {
                            flex: 1;
                            display: flex;
                            flex-direction: column;
                            gap: 1.5rem;
                        }

                        .expanded-section {
                            h4 {
                                @mixin text-regular-medium;
                                color: #f2f2f5;
                                margin-bottom: 0.5rem;
                            }

                            p {
                                @mixin text-light-small;
                                color: rgba(255, 255, 255, 0.6);
                                margin-bottom: 0.25rem;

                                &:last-child {
                                    margin-bottom: 0;
                                }
                            }
                        }
                    }
                }
            }

            &.is-expanded .card-inner {
                .card-front .card-expanded {
                    max-height: 1000px;
                    opacity: 1;
                }
            }

            &.is-mobile-expanded .card-inner {
                @media screen and (max-width: $mobile) {
                    .card-front .card-expanded {
                        max-height: 3000px;
                        opacity: 1;
                    }
                }
            }
        }
    }
}

.portfolio-error {
    width: 100%;
    min-height: 60vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background: rgba(255, 255, 255, 0.02);
    border-radius: 2.5rem;
    border: 1px solid rgba(255, 255, 255, 0.08);
    margin-top: 2rem;
}

.portfolio-error-content {
    text-align: center;
    padding: 3rem;

    h3 {
        font-family: "Unbounded", sans-serif;
        font-weight: 700;
        font-size: 1.5rem;
        margin-bottom: 2rem;
        color: rgba(255, 255, 255, 0.7);
    }
}

.retry-button {
    padding: 1rem 2rem;
    background: linear-gradient(
        135deg,
        rgba(255, 255, 255, 0.1) 0%,
        rgba(255, 255, 255, 0.05) 100%
    );
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 0.5rem;
    font-weight: 600;
    font-family: "Geologica", sans-serif;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.15) 0%,
            rgba(255, 255, 255, 0.1) 100%
        );
        border-color: rgba(255, 255, 255, 0.3);
        transform: translateY(-2px);
    }
}
</style>
