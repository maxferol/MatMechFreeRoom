import requests
import json
from datetime import datetime, timedelta

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

# Генерируем даты на неделю вперед от текущей даты
start_date = datetime.now().date()
dates_to_parse = [(start_date + timedelta(days=i)).isoformat() for i in range(7)]

def check_address_and_auditory(subject):
    """Проверяем, что аудитория находится по адресу Тургенева, 4 и начинается с 6"""
    if (subject.get('auditoryLocation') and 'Тургенева, 4' in subject['auditoryLocation'] 
            and subject.get('auditoryTitle') and (subject['auditoryTitle'][0] == '6' or subject['auditoryTitle'][0] == '5')):
        return True
    return False

# Структура для хранения данных по датам: {date: {auditory: [pair_numbers]}}
schedule_by_date = {}

# Получаем список групп
response = requests.get('https://urfu.ru/api/v2/schedule/groups?search=МЕН', headers=headers, timeout=10)
data = response.json()

print(f"Найденные группы: {[group['title'] for group in data]}\n")

# Парсим расписание для каждой даты
for target_date in dates_to_parse:
    print(f"Обработка даты: {target_date}")
    
    params = {
        'date_gte': target_date,
        'date_lte': target_date
    }
    
    date_schedule = {}  # {auditory: [pair_numbers]} для конкретной даты
    
    for group in data:
        group_id = group['id']
        group_title = group['title']
        
        try:
            response = requests.get(
                f'https://urfu.ru/api/v2/schedule/groups/{group_id}/schedule',
                headers=headers,
                params=params,
                timeout=10
            )
            group_data = response.json()
            
            # Фильтруем события
            for event in group_data.get('events', []):
                if check_address_and_auditory(event):
                    room_number = event['auditoryTitle']
                    pair_number = event['pairNumber']
                    
                    # Добавляем пару в расписание для этой аудитории
                    if room_number not in date_schedule:
                        date_schedule[room_number] = []
                    
                    if pair_number not in date_schedule[room_number]:
                        date_schedule[room_number].append(pair_number)
            
        except Exception as e:
            print(f"  Ошибка при обработке группы {group_title}: {e}")
            continue
    
    # Сортируем пары для каждой аудитории
    for room in date_schedule:
        date_schedule[room].sort()
    
    schedule_by_date[target_date] = date_schedule
    print(f"  Итого по дате {target_date}: {len(date_schedule)} аудиторий\n")

# Сохраняем результат в JSON файл
output_data = {
    'generated_at': datetime.now().isoformat(),
    'period': {
        'start': dates_to_parse[0],
        'end': dates_to_parse[-1]
    },
    'schedule': schedule_by_date
}

with open('schedule_week.json', 'w', encoding='utf-8') as f:
    json.dump(output_data, f, ensure_ascii=False, indent=2)

print(f"✅ Данные сохранены в файл 'schedule_week.json'")
print(f"Обработано дат: {len(dates_to_parse)}")

# Выводим краткую статистику
print("\nКраткая статистика по дням:")
for date, rooms in schedule_by_date.items():
    if rooms:
        print(f"  {date}:")
        for room, pairs in rooms.items():
            print(f"    - Аудитория {room}: пары {pairs}")
    else:
        print(f"  {date}: нет занятых аудиторий")