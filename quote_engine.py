def get_state_tax(state):
    rates = {
        "AL": 0.04,    "AK": 0.00,  "AZ": 0.056, "AR": 0.065, "CA": 0.0625, "CO": 0.029,
        "CT": 0.0635,  "DE": 0.00,  "DC": 0.06,   "FL": 0.06,   "GA": 0.04,   "HI": 0.04,
        "ID": 0.06,    "IL": 0.0625,"IN": 0.07,   "IA": 0.06,   "KS": 0.065,  "KY": 0.06,
        "LA": 0.05,    "ME": 0.055, "MD": 0.06,   "MA": 0.0625,"MI": 0.06,   "MN": 0.06875,
        "MS": 0.07,    "MO": 0.04225,"MT": 0.00,  "NE": 0.055,  "NV": 0.0685, "NH": 0.00,
        "NJ": 0.06625, "NM": 0.04875,"NY": 0.04,  "NC": 0.0475, "ND": 0.05,   "OH": 0.0575,
        "OK": 0.045,   "OR": 0.00,   "PA": 0.06,   "RI": 0.07,   "SC": 0.06,   "SD": 0.045,
        "TN": 0.07,    "TX": 0.0625, "UT": 0.0485, "VT": 0.06,   "VA": 0.043,  "WA": 0.065,
        "WV": 0.06,    "WI": 0.05,   "WY": 0.04
    }
    return rates.get(state.upper(), 0.0)

def get_cleanliness_multiplier(level):
    return {
        0: 1.00,
        1: 1.05,
        2: 1.10,
        3: 1.20,
        4: 1.30,
        5: 1.50
    }.get(level, 1.00)


def get_knickknack_fee(level):
    return [0, 10, 15, 20][level] if level in [0, 1, 2, 3] else 0


def get_floor_type_cost(carpet=False, hardwood=False, tile=False, laminate=False):
    cost = 0
    if carpet: cost += 10
    if hardwood: cost += 15
    if tile: cost += 15
    if laminate: cost += 10
    return cost


def calculate_quote(data: dict):
    sqft = data['square_footage']
    pets = data['num_pets']
    num_windows = data['num_windows']
    outside_windows = data['windows_outside']
    cleanliness = data['cleanliness']
    travel_miles = data['travel_miles']
    state = data['state']

    floor_fee = get_floor_type_cost(
        carpet=data.get("floor_carpet", False),
        hardwood=data.get("floor_hardwood", False),
        tile=data.get("floor_tile", False),
        laminate=data.get("floor_laminate", False),
    )
    knick_fee = get_knickknack_fee(data['knickknack'])

    base = sqft * 0.12
    pet_fee = pets * 15
    window_fee = num_windows * (7 if outside_windows else 4)
    travel_fee = travel_miles * 2 * 0.5
    multiplier = get_cleanliness_multiplier(cleanliness)

    subtotal = (base + pet_fee + floor_fee + window_fee + knick_fee + travel_fee) * multiplier
    tax = subtotal * get_state_tax(state)
    total = subtotal + tax

    return {
        "base_rate": base,
        "pet_fee": pet_fee,
        "floor_fee": floor_fee,
        "window_fee": window_fee,
        "knickknack_fee": knick_fee,
        "travel_fee": travel_fee,
        "cleanliness_multiplier": multiplier,
        "subtotal": subtotal,
        "tax": tax,
        "total": total,
        "biweekly": total * 0.5,
        "weekly": total * 0.333
    }