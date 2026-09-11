<?php

namespace Pterodactyl\Http\Requests\Api\Client\Account;

use Pterodactyl\Http\Requests\Api\Client\ClientApiRequest;

class UpdateServerOrderRequest extends ClientApiRequest
{
    public function rules(): array
    {
        return [
            'order' => 'present|array|max:500',
            'order.*' => 'required|string|min:8|max:36',
        ];
    }
}
