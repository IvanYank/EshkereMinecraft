// export default function validateForm() {
//     setErrorList(errorListInitialState)

//     let errorStatus = true

//     switch (dialogType) {
//       case "Авторизация":
//         if (formValues.password.length < 6) {
//           errorStatus = false
//           setErrorList(prev => ({
//             ...prev,
//             password: "Пароль меньше 6 символов"
//           }))
//         }

//         if (formValues.nickname.length == 0) {
//           errorStatus = false
//           setErrorList(prev => ({
//             ...prev,
//             nickname: "Поле должно быть заполнено"
//           }))
//         }

//         break;

//       case "Регистрация":
//         if (formValues.password.length < 6) {
//           errorStatus = false
//           setErrorList(prev => ({
//             ...prev,
//             password: "Пароль меньше 6 символов"
//           }))
//         }

//         if (formValues.nickname.length == 0) {
//           errorStatus = false
//           setErrorList(prev => ({
//             ...prev,
//             nickname: "Поле должно быть заполнено"
//           }))
//         }

//         if (formValues.passwordSecond.length == 0) {
//           errorStatus = false
//           setErrorList(prev => ({
//             ...prev,
//             passwordSecond: "Поле должно быть заполнено"
//           }))
//         }

//         if (formValues.token.length == 0) {
//           errorStatus = false
//           setErrorList(prev => ({
//             ...prev,
//             token: "Поле должно быть заполнено"
//           }))
//         }

//         break;

//       case "Настройки":
//         if (formValues.old_password.length < 6) {
//           errorStatus = false
//           setErrorList(prev => ({
//             ...prev,
//             old_password: "Пароль меньше 6 символов"
//           }))
//         }

//         if (formValues.new_password.length < 6) {
//           errorStatus = false
//           setErrorList(prev => ({
//             ...prev,
//             new_password: "Пароль меньше 6 символов"
//           }))
//         }

//         break;
//     }

//     return errorStatus
// }