<template>
    <footer id="footer">
        <div class="footer-background">
            <div class="dark"></div>
            <TheFractalBackground @raster-ready="handleFractalReady" />
        </div>
        <hr />
        <div class="content">
            <div>
                <div class="header">
                    <h2>
                        Создаём среду, в которой<br />
                        идеи становятся событием
                    </h2>
                    <p>
                        Разрабатываем и реализуем ваше событие,<br />
                        техническую документацию и креативный концепт.
                    </p>
                    <div class="socials">
                        <NuxtLink external to="tel:+74991363060" class="phone">
                            <img src="~/assets/img/phone.svg" alt="" />
                            <p>+7 (499) 136-30-60</p>
                        </NuxtLink>
                        <NuxtLink external to="https://t.me/showsystemmoscow">
                            <img src="~/assets/img/telegram.svg" alt="" />
                            <p>Telegram</p>
                        </NuxtLink>
                        <!-- <NuxtLink external to="">
                            <img src="~/assets/img/vk.svg" alt="" />
                            <p>ВКонтакте</p>
                        </NuxtLink>
                        <NuxtLink external to="">
                            <img src="~/assets/img/dzen.svg" alt="" />
                            <p>Дзен</p>
                        </NuxtLink> -->
                        <hr />
                    </div>
                </div>
                <div class="form">
                    <TheInput
                        v-model="data.company"
                        icon="user"
                        placeholder="Название компании"
                    />
                    <TheInput
                        v-model="data.phone"
                        icon="phone"
                        placeholder="Номер телефона"
                    />
                    <TheInput
                        v-model="data.telegram"
                        icon="telegram"
                        placeholder="Ваш Телеграм"
                    />
                    <TheButton @click="handleSubmit" :disabled="isSubmitting">
                        {{ isSubmitting ? "Отправка..." : "Отправить заявку" }}
                    </TheButton>
                </div>
                <Transition name="fade">
                    <div v-if="successMessage" class="message success">
                        {{ successMessage }}
                    </div>
                </Transition>
                <Transition name="fade">
                    <div v-if="errorMessage" class="message error">
                        {{ errorMessage }}
                    </div>
                </Transition>
                <div class="agreement">
                    <p>
                        Нажимая кнопку "Отправить заявку", вы принимаете условия
                    </p>
                    <p>
                        пользовательского соглашения и даете согласие на
                        <NuxtLink to="/privacy"
                            >обработку персональных данных</NuxtLink
                        >
                    </p>
                </div>
            </div>
            <div>
                <hr />
                <img src="~/assets/img/wordmark.svg" alt="" />
                <hr />
            </div>
            <div>
                <p>{{ new Date().getFullYear() }} © SHOWSYSTEM</p>
                <!-- <span>/</span>
                <NuxtLink external to="">Пользовательское соглашение</NuxtLink>
                <span>/</span>
                <NuxtLink external to="">Политика конфиденциальности</NuxtLink>
                <span>/</span>
               <NuxtLink external to="">Контактная информация компании</NuxtLink> -->
            </div>
        </div>
    </footer>
</template>

<script lang="ts" setup>
const { submitRequest } = useDirectus();

const handleFractalReady = () => {};

const data = ref({
    company: "",
    phone: "",
    telegram: "",
});

const isSubmitting = ref(false);
const errorMessage = ref("");
const successMessage = ref("");

const validateForm = () => {
    if (!data.value.company.trim()) {
        errorMessage.value = "Пожалуйста, укажите название компании";
        return false;
    }
    if (!data.value.phone.trim()) {
        errorMessage.value = "Пожалуйста, укажите номер телефона";
        return false;
    }
    if (!data.value.telegram.trim()) {
        errorMessage.value = "Пожалуйста, укажите Telegram";
        return false;
    }
    return true;
};

const handleSubmit = async () => {
    errorMessage.value = "";
    successMessage.value = "";

    if (!validateForm()) {
        return;
    }

    isSubmitting.value = true;

    try {
        await submitRequest(data.value);

        successMessage.value =
            "Заявка успешно отправлена! Мы свяжемся с вами в ближайшее время.";

        // Очищаем форму после успешной отправки
        data.value = {
            company: "",
            phone: "",
            telegram: "",
        };

        // Скрываем сообщение об успехе через 5 секунд
        setTimeout(() => {
            successMessage.value = "";
        }, 5000);
    } catch (error) {
        errorMessage.value =
            error instanceof Error
                ? error.message
                : "Произошла ошибка при отправке заявки";

        // Скрываем сообщение об ошибке через 5 секунд
        setTimeout(() => {
            errorMessage.value = "";
        }, 5000);
    } finally {
        isSubmitting.value = false;
    }
};
</script>

<style lang="postcss" scoped>
@import url(~/assets/css/_variables.css);

footer {
    width: 100%;
    padding: 2rem 4rem 0 4rem;

    display: flex;
    flex-direction: column;

    gap: 5rem;

    position: relative;

    @media screen and (max-width: $mobile) {
        padding: 2rem 2rem 0 2rem;
    }

    .footer-background {
        width: 100%;
        height: 100%;

        position: absolute;
        left: 0;
        top: -45%;

        pointer-events: none;

        z-index: -10;

        @media screen and (max-width: $mobile) {
            top: -20%;
        }

        .dark {
            width: 100%;
            height: 100%;

            position: absolute;
            bottom: -50%;
            left: 0;

            background: radial-gradient(
                136.99% 100.69% at 50% 25.55%,
                rgba(0, 0, 0, 0) 40%,
                #000 70%
            );

            z-index: -9;
        }

        .fractal-background {
            position: absolute;
            top: 0;
            left: 0;
            min-width: 100dvw;
            max-width: 100dvw;
            height: auto;
        }
    }

    .content {
        width: 100%;
        padding: 2rem 1.25rem;

        display: flex;
        flex-direction: column;
        gap: 2rem;

        border-radius: 2.5rem 2.5rem 0 0;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-bottom: none;
        background: rgba(255, 255, 255, 0.04);
        backdrop-filter: blur(8px);

        > * {
            width: 100%;
        }

        > div:nth-child(1) {
            display: flex;
            flex-direction: column;
            gap: 1rem;

            .header {
                display: grid;
                grid-template-columns: 2fr 1.25fr 0.75fr;

                @media screen and (max-width: $mobile) {
                    display: flex;
                    flex-direction: column;
                    gap: 2rem;
                }

                h2 {
                    margin-left: 0.75rem;
                    @mixin display-bold-medium;
                    color: #f2f2f5;
                    text-transform: uppercase;

                    @media screen and (max-width: $mobile) {
                        margin-left: 0;
                    }
                }

                p {
                    @mixin text-light-medium;
                    color: rgba(255, 255, 255, 0.48);
                }

                .socials {
                    display: flex;
                    gap: 0.5rem;
                    justify-self: flex-end;

                    @media screen and (max-width: $mobile) {
                        flex-direction: column;
                        gap: 2rem;

                        a p,
                        hr {
                            display: block !important;
                        }
                    }

                    hr {
                        display: none;
                    }

                    a {
                        padding: 0.75rem;

                        display: flex;
                        justify-content: center;
                        align-items: center;
                        gap: 1rem;

                        border-radius: 1.25rem;
                        border: 1px solid rgba(255, 255, 255, 0.08);
                        background: rgba(255, 255, 255, 0.04);

                        cursor: pointer;
                        text-decoration: none;

                        img {
                            width: 2rem;
                            height: 2rem;

                            transition: all 0.3s ease;
                        }

                        p {
                            min-width: max-content;
                            display: none;
                            color: $white;
                            text-decoration: none;
                        }

                        &.phone p {
                            display: block;
                        }

                        &:hover img {
                            transform: scale(0.9);
                        }
                    }
                }
            }

            .agreement {
                display: flex;
                justify-content: space-between;

                @mixin text-light-small;
                color: rgba(255, 255, 255, 0.28);

                @media screen and (max-width: $mobile) {
                    display: block;

                    > * {
                        display: contents;
                    }
                }

                a {
                    @mixin text-light-small;
                    color: rgba(255, 255, 255, 0.28);
                    text-decoration: underline;
                    transition:
                        color 0.3s ease,
                        opacity 0.3s ease;

                    &:hover {
                        color: rgba(255, 255, 255, 0.48);
                        opacity: 0.8;
                    }
                }
            }

            .form {
                width: 100%;
                margin-top: 0.5rem;

                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 0.5rem;

                @media screen and (max-width: $mobile) {
                    display: flex;
                    flex-direction: column;
                    gap: 2rem;
                }
            }

            .message {
                padding: 1rem 1.5rem;
                border-radius: 1.25rem;
                @mixin text-light-medium;

                &.success {
                    background: rgba(34, 197, 94, 0.1);
                    border: 1px solid rgba(34, 197, 94, 0.3);
                    color: #22c55e;
                }

                &.error {
                    background: rgba(239, 68, 68, 0.1);
                    border: 1px solid rgba(239, 68, 68, 0.3);
                    color: #ef4444;
                }
            }
        }

        > div:nth-child(2) {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 1.5rem;
        }

        > div:nth-child(3) {
            display: flex;
            justify-content: space-between;

            @mixin text-light-medium;

            @media screen and (max-width: $mobile) {
                display: flex;
                flex-direction: column-reverse;
                flex-wrap: wrap;

                gap: 1rem 0.5rem;

                justify-content: flex-start;

                span {
                    display: none;
                }

                p,
                a {
                    &::after {
                        content: "/";
                        margin-left: 0.5rem;

                        color: #161616;
                    }
                }
            }

            p,
            a {
                color: rgba(255, 255, 255, 0.24) !important;
            }

            a {
                text-decoration: none;

                &:hover {
                    text-decoration: underline;
                }
            }

            span {
                color: #161616;
            }
        }
    }
}

.fade-enter-active,
.fade-leave-active {
    transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
    transform: translateY(-10px);
}
</style>
